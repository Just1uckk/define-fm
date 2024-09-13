import React from 'react';
import { Navigate } from 'react-router-dom';
import { BoundCanProps } from '@casl/react';
import { Can } from 'casl';
import { AppAbility } from 'casl/ability';
import { useAppNavigationContext } from 'shared/context/app-navigation-context';

import { NotFoundPage } from 'shared/components/404/not-found-page';

type RoleGuardProps = BoundCanProps<AppAbility>;

export const RoleGuard: React.FC<React.PropsWithChildren<RoleGuardProps>> = ({
	children,
	...props
}) => {
	const { navigationLinks } = useAppNavigationContext();

	return (
		<Can {...props} passThrough>
			{(allowed) =>
				allowed ? (
					children
				) : navigationLinks[0] ? (
					<Navigate to={navigationLinks[0].path} replace />
				) : (
					<NotFoundPage />
				)
			}
		</Can>
	);
};
