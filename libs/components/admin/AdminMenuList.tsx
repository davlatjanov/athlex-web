import React, { useEffect, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import Link from 'next/link';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Headset, User, UserCircleGear, Package, Gauge } from 'phosphor-react';
import cookies from 'js-cookie';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const AdminMenuList = (props: any) => {
	const device = useDeviceDetect();
	const [openMenu] = useState(typeof window === 'object' ? cookies.get('admin_menu') === 'true' : false);
	const [clickMenu, setClickMenu] = useState<string[]>([]);
	const [clickSubMenu, setClickSubMenu] = useState('');

	const {
		router: { pathname },
	} = props;

	const pathnames = pathname.split('/').filter((x: any) => x);

	/** LIFECYCLES **/
	useEffect(() => {
		switch (pathnames[1]) {
			case 'users':
				setClickMenu(['Users']);
				break;
			case 'properties':
				setClickMenu(['Programs']);
				break;
			case 'products':
				setClickMenu(['Products']);
				break;
			case 'cs':
				setClickMenu(['CS']);
				break;
			default:
				setClickMenu([]);
				break;
		}

		switch (pathnames[2]) {
			case 'notice':
				setClickSubMenu('Notice');
				break;
			case 'faq':
				setClickSubMenu('FAQ');
				break;
			default:
				setClickSubMenu('List');
				break;
		}
	}, []);

	/** HANDLERS **/
	const subMenuChangeHandler = (target: string) => {
		if (clickMenu.includes(target)) {
			setClickMenu(clickMenu.filter((m) => m !== target));
		} else {
			setClickMenu([...clickMenu, target]);
		}
	};

	const menu_set = [
		{
			title: 'Dashboard',
			icon: <Gauge size={20} color="#6B7280" weight="fill" />,
			url: '/_admin',
		},
		{
			title: 'Users',
			icon: <User size={20} color="#6B7280" weight="fill" />,
			on_click: () => subMenuChangeHandler('Users'),
		},
		{
			title: 'Programs',
			icon: <UserCircleGear size={20} color="#6B7280" weight="fill" />,
			on_click: () => subMenuChangeHandler('Programs'),
		},
		{
			title: 'Products',
			icon: <Package size={20} color="#6B7280" weight="fill" />,
			on_click: () => subMenuChangeHandler('Products'),
		},
		{
			title: 'CS',
			icon: <Headset size={20} color="#6B7280" weight="fill" />,
			on_click: () => subMenuChangeHandler('CS'),
		},
	];

	const sub_menu_set: Record<string, { title: string; url: string }[]> = {
		Users: [{ title: 'List', url: '/_admin/users' }],
		Programs: [{ title: 'List', url: '/_admin/properties' }],
		Products: [{ title: 'List', url: '/_admin/products' }],
		CS: [
			{ title: 'FAQ', url: '/_admin/cs/faq' },
			{ title: 'Notice', url: '/_admin/cs/notice' },
		],
	};

	const isDashboardActive = pathnames.length === 1 && pathnames[0] === '_admin';

	return (
		<>
			{menu_set.map((item, index) => {
				// Dashboard is a direct link, no submenu
				if (item.url) {
					return (
						<List className={'menu_wrap'} key={index} disablePadding>
							<Link href={item.url}>
								<ListItemButton
									component={'li'}
									className={isDashboardActive ? 'menu on' : 'menu'}
									sx={{ minHeight: 48, px: 2.5 }}
								>
									<ListItemIcon sx={{ minWidth: 0, mr: 'auto', justifyContent: 'center' }}>
										{item.icon}
									</ListItemIcon>
									<ListItemText>{item.title}</ListItemText>
								</ListItemButton>
							</Link>
						</List>
					);
				}

				return (
					<List className={'menu_wrap'} key={index} disablePadding>
						<ListItemButton
							onClick={item.on_click}
							component={'li'}
							className={clickMenu[0] === item.title ? 'menu on' : 'menu'}
							sx={{ minHeight: 48, justifyContent: openMenu ? 'initial' : 'center', px: 2.5 }}
						>
							<ListItemIcon sx={{ minWidth: 0, mr: openMenu ? 3 : 'auto', justifyContent: 'center' }}>
								{item.icon}
							</ListItemIcon>
							<ListItemText>{item.title}</ListItemText>
							{clickMenu.includes(item.title) ? <ExpandLess /> : <ExpandMore />}
						</ListItemButton>
						<Collapse
							in={clickMenu.includes(item.title)}
							className="menu"
							timeout="auto"
							component="li"
							unmountOnExit
						>
							<List className="menu-list" disablePadding>
								{sub_menu_set[item.title]?.map((sub, i) => (
									<Link href={sub.url} shallow={true} replace={true} key={i}>
										<ListItemButton
											component="li"
											className={clickMenu[0] === item.title && clickSubMenu === sub.title ? 'li on' : 'li'}
										>
											<Typography component={'span'}>{sub.title}</Typography>
										</ListItemButton>
									</Link>
								))}
							</List>
						</Collapse>
					</List>
				);
			})}
		</>
	);
};

export default withRouter(AdminMenuList);
