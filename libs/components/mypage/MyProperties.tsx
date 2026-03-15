import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from './PropertyCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Program } from '../../types/program/program';
import { T } from '../../types/common';
import { ProgramStatus } from '../../enums/training-program.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { UPDATE_PROGRAM, DELETE_PROGRAM } from '../../../apollo/user/mutation';
import { GET_MY_PROGRAMS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
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
	const paginationHandler = (e: T, value: number) => {
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

	if (device === 'mobile') {
		return <div>MY PROGRAMS MOBILE</div>;
	} else {
		return (
			<div id="my-programs-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Programs</Typography>
						<Typography className="sub-title">Manage the training programs you coach.</Typography>
					</Stack>
				</Stack>
				<Stack className="property-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(ProgramStatus.ACTIVE)}
							className={searchFilter.programStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							Active
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(ProgramStatus.ARCHIVED)}
							className={searchFilter.programStatus === 'ARCHIVED' ? 'active-tab-name' : 'tab-name'}
						>
							Archived
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Program</Typography>
							<Typography className="title-text">Published</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">Views</Typography>
							<Typography className="title-text">Action</Typography>
						</Stack>

						{myPrograms?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No programs found yet.</p>
							</div>
						) : (
							myPrograms.map((program: Program) => {
								return (
									<PropertyCard
										program={program}
										deleteProgramHandler={deleteProgramHandler}
										updateProgramHandler={updateProgramHandler}
										key={program._id}
									/>
								);
							})
						)}

						{myPrograms.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} program{total === 1 ? '' : 's'} available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		programStatus: 'ACTIVE',
	},
};

export default MyProperties;
