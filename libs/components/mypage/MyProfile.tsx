import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { Messages } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';

const MyProfile: NextPage = ({ initialValues }: any) => {
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberFullName: user.memberFullName,
			memberDesc: user.memberDesc,
			memberImage: user.memberImage,
		});
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', image);

			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			setUpdateData({ ...updateData, memberImage: responseImage });
		} catch (err) {
			sweetMixinErrorAlert('Image upload failed. Please try again.').then();
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			updateData._id = user._id;
			const result = await updateMember({ variables: { input: updateData } });

			//@ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			sweetMixinSuccessAlert('Profile updated successfully');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData]);

	const doDisabledCheck = () => {
		return !updateData.memberNick || !updateData.memberPhone;
	};

	return (
		<div id="my-profile-page">
			<div className="main-title-box">
				<div className="right-box">
					<span className="main-title">My Profile</span>
					<span className="sub-title">We are glad to see you again!</span>
				</div>
			</div>
			<div className="top-box">
				<div className="photo-box">
					<span className="title">Photo</span>
					<div className="image-big-box">
						<div className="image-box">
							<img src={updateData?.memberImage || '/img/profile/defaultUser.svg'} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }} />
						</div>
						<div className="upload-big-box">
							<input
								type="file"
								hidden
								id="hidden-input"
								onChange={uploadImage}
								accept="image/jpg, image/jpeg, image/png"
							/>
							<label htmlFor="hidden-input" className="labeler">
								<span>Upload Profile Image</span>
							</label>
							<span className="upload-text">A photo must be in JPG, JPEG or PNG format!</span>
						</div>
					</div>
				</div>
				<div className="small-input-box">
					<div className="input-box">
						<span className="title">Username</span>
						<input
							type="text"
							placeholder="Your username"
							value={updateData.memberNick ?? ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
						/>
					</div>
					<div className="input-box">
						<span className="title">Phone</span>
						<input
							type="text"
							placeholder="Your phone"
							value={updateData.memberPhone ?? ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
						/>
					</div>
					<div className="input-box">
						<span className="title">Full Name</span>
						<input
							type="text"
							placeholder="Your full name"
							value={updateData.memberFullName ?? ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberFullName: value })}
						/>
					</div>
				</div>
				<div className="desc-box">
					<span className="title">Bio</span>
					<textarea
						rows={4}
						placeholder="Tell something about yourself..."
						value={updateData.memberDesc ?? ''}
						onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
					/>
				</div>
				<div className="about-me-box">
					<button className="update-button" onClick={updateProfileHandler} disabled={doDisabledCheck()}>
						<span>Update Profile</span>
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
							<g clipPath="url(#clip0_7065_6985)">
								<path
									d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
									fill="white"
								/>
							</g>
							<defs>
								<clipPath id="clip0_7065_6985">
									<rect width="13" height="13" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberFullName: '',
		memberDesc: '',
	},
};

export default MyProfile;
