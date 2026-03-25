import React, { useState } from 'react';
import { NextPage } from 'next';
import { ProgramCard } from './ProgramCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Program } from '../../types/program/program';
import { T } from '../../types/common';
import { ProgramStatus } from '../../enums/training-program.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { UPDATE_PROGRAM, DELETE_PROGRAM } from '../../../apollo/user/mutation';
import { GET_MY_PROGRAMS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyPrograms: NextPage = ({ initialInput, ...props }: any) => {
	const [searchFilter, setSearchFilter] = useState<any>(initialInput);
	const [myPrograms, setAgentProperties] = useState<Program[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updateProgram] = useMutation(UPDATE_PROGRAM);
	const [deleteProgram] = useMutation(DELETE_PROGRAM);

	const {
		loading: getMyProgramsLoading,
		data: getMyProgramsData,
		error: getMyProgramsError,
		refetch: getMyProgramsRefetch,
	} = useQuery(GET_MY_PROGRAMS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getMyPrograms?.list);
			setTotal(data?.getMyPrograms?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (_: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ProgramStatus) => {
		setSearchFilter({ ...searchFilter, programStatus: value });
	};

	const deleteProgramHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('are you sure to delete this program?')) {
				await deleteProgram({
					variables: { programId: id },
				});
				await getMyProgramsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateProgramHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`are you sure to change to ${status} status?`)) {
				await updateProgram({
					variables: {
						programId: id,
						input: { programStatus: status },
					},
				});
				await getMyProgramsRefetch({ input: searchFilter });
			}
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'TRAINER' && user?.memberType !== 'ADMIN') {
		router.back();
	}

	const totalPages = Math.ceil(total / searchFilter.limit);

	return (
		<div id="my-programs-page">
			<div className="main-title-box">
				<div className="right-box">
					<span className="main-title">My Programs</span>
					<span className="sub-title">Manage the training programs you coach.</span>
				</div>
			</div>
			<div className="property-list-box">
				<div className="tab-name-box">
					<span
						onClick={() => changeStatusHandler(ProgramStatus.ACTIVE)}
						className={searchFilter.programStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
					>
						Active
					</span>
					<span
						onClick={() => changeStatusHandler(ProgramStatus.ARCHIVED)}
						className={searchFilter.programStatus === 'ARCHIVED' ? 'active-tab-name' : 'tab-name'}
					>
						Archived
					</span>
				</div>
				<div className="list-box">
					<div className="listing-title-box">
						<span className="title-text">Program</span>
						<span className="title-text">Published</span>
						<span className="title-text">Status</span>
						<span className="title-text">Views</span>
						<span className="title-text">Action</span>
					</div>

					{myPrograms?.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No programs found yet.</p>
						</div>
					) : (
						myPrograms.map((program: Program) => {
							return (
								<ProgramCard
									program={program}
									deleteProgramHandler={deleteProgramHandler}
									updateProgramHandler={updateProgramHandler}
									key={program._id}
								/>
							);
						})
					)}

					{myPrograms.length !== 0 && (
						<div className="pagination-config">
							<div className="pagination-box">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
									<button
										key={n}
										onClick={() => paginationHandler(null, n)}
										style={{
											width: 32, height: 32, borderRadius: '50%',
											background: searchFilter.page === n ? '#E92C28' : 'transparent',
											color: searchFilter.page === n ? '#fff' : '#9CA3AF',
											border: searchFilter.page === n ? 'none' : '1px solid rgba(255,255,255,0.1)',
											cursor: 'pointer', fontSize: 13, fontWeight: 600,
										}}
									>
										{n}
									</button>
								))}
							</div>
							<div className="total-result">
								<span>{total} program{total === 1 ? '' : 's'} available</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

MyPrograms.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		programStatus: 'ACTIVE',
	},
};

export default MyPrograms;
