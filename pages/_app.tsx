import type { AppProps } from 'next/app';
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { CartProvider } from '../libs/context/CartContext';
import '../scss/tailwind.css';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<CartProvider>
				<Component {...pageProps} />
			</CartProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
