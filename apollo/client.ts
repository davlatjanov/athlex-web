import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import decodeJWT from 'jwt-decode';
import { sweetErrorAlert } from '../libs/sweetAlert';
// apollo-link-token-refresh removed: backend issues 30-day tokens with no refresh endpoint
import { socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

/** Returns true if the stored token is missing or still valid, false if it has expired. */
function isTokenValid(): boolean {
	const token = getJwtToken();
	if (!token) return true; // no token — unauthenticated user, let it through
	try {
		const { exp } = decodeJWT<{ exp?: number }>(token);
		if (!exp) return true;
		return Date.now() < exp * 1000;
	} catch {
		return false;
	}
}

/** Link that checks token expiry before every request and redirects to login if expired. */
const tokenExpiryLink = new ApolloLink((operation, forward) => {
	if (!isTokenValid()) {
		localStorage.removeItem('accessToken');
		if (typeof window !== 'undefined' && !window.location.pathname.includes('/account/join')) {
			window.location.href = '/account/join';
		}
	}
	return forward(operation);
});

class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
		socketVar(this.socket);

		this.socket.onopen = () => {
			console.log('WebSocket connection!');
		};

		this.socket.onmessage = (msg) => {
			console.log('WebSocket message:', msg.data);
		};

		this.socket.onerror = (error) => {
			console.log('WebSocket error', error);
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			console.warn('requesting.. ', operation);
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		});

		/* WEBSOCKET SUBSCRIPTION LINK */
		const wsLink = new WebSocketLink({
			uri: process.env.NEXT_PUBLIC_API_WS ?? 'ws://localhost:4000/graphql',
			options: {
				reconnect: false,
				timeout: 30000,
				connectionParams: () => {
					return { headers: getHeaders() };
				},
			},
			webSocketImpl: LoggingWebSocket,
		});

		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					// Handle expired/invalid tokens
					if (
						extensions?.code === 'UNAUTHENTICATED' ||
						message.includes('UNAUTHENTICATED') ||
						message.includes('jwt expired') ||
						message.includes('jwt malformed')
					) {
						localStorage.removeItem('accessToken');
						if (typeof window !== 'undefined' && !window.location.pathname.includes('/account/join')) {
							window.location.href = '/account/join';
						}
						return;
					}
					const silent = message.includes('input') || message.toLowerCase().includes('not found') || message.toLowerCase().includes('no data') || message.toLowerCase().includes('cannot find') || message.toLowerCase().includes('does not exist');
					if (!silent) sweetErrorAlert(message);
				});
			}
			if (networkError) console.log(`[Network error]: ${networkError}`);
			// @ts-ignore
			if (networkError?.statusCode === 401) {
				localStorage.removeItem('accessToken');
				if (typeof window !== 'undefined' && !window.location.pathname.includes('/account/join')) {
					window.location.href = '/account/join';
				}
			}
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(link),
		);

		return from([tokenExpiryLink, errorLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/
