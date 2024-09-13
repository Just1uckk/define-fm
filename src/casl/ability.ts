import { Ability, AbilityBuilder } from '@casl/ability';

import { IUser } from 'shared/types/users';

import { APP_ROLES } from 'shared/constants/constans';

export enum RouteGuardActions {
	create = 'create',
	read = 'read',
	update = 'update',
	delete = 'delete',
	manage = 'manage',
}

export enum RouteGuardEntities {
	User = 'User',
	RdaWorkPackages = 'RdaWorkPackages',
	PersonalRecords = 'PersonalRecords',
	DispositionSearches = 'DispositionSearches',
	DispositionReport = 'DispositionReport',
	Group = 'Group',
	RdaAppSettings = 'RdaAppSettings',
	CoreAppSettings = 'CoreAppSettings',
	DashboardPage = 'DashboardPage',
	Dashboard = 'Dashboard',
	PersonalDashboard = 'PersonalDashboard',
}

type Action = RouteGuardActions;
type Subject = RouteGuardEntities;
export type AppAbility = Ability<[Action, Subject]>;

export default function defineAbilityFor(user?: IUser | null) {
	const { can, build } = new AbilityBuilder<AppAbility>(Ability);

	if (user?.roles.includes(APP_ROLES.GLOBAL_ADMIN)) {
		can(RouteGuardActions.manage, RouteGuardEntities.User);
	}

	if (
		user?.roles.some((role) =>
			[
				APP_ROLES.GLOBAL_ADMIN,
				APP_ROLES.RECORD_MANAGER,
				APP_ROLES.APPROVER,
			].includes(role),
		)
	) {
		can(RouteGuardActions.read, RouteGuardEntities.User);
		can(RouteGuardActions.read, RouteGuardEntities.DashboardPage);
	}

	if (
		user?.roles.some((role) =>
			[APP_ROLES.GLOBAL_ADMIN, APP_ROLES.RECORD_MANAGER].includes(role),
		)
	) {
		can(RouteGuardActions.manage, RouteGuardEntities.RdaWorkPackages);
		can(RouteGuardActions.manage, RouteGuardEntities.DispositionSearches);
		can(RouteGuardActions.manage, RouteGuardEntities.DispositionReport);
		can(RouteGuardActions.read, RouteGuardEntities.Dashboard);
	}

	if (
		user?.roles.some((role) =>
			[
				APP_ROLES.GLOBAL_ADMIN,
				APP_ROLES.RECORD_MANAGER,
				APP_ROLES.APPROVER,
			].includes(role),
		)
	) {
		can(RouteGuardActions.manage, RouteGuardEntities.PersonalRecords);
	}

	if (user?.roles.includes(APP_ROLES.GROUP_MANAGER)) {
		can(RouteGuardActions.create, RouteGuardEntities.Group);
		can(RouteGuardActions.delete, RouteGuardEntities.Group);
	}

	if (
		user?.roles.some((role) =>
			[APP_ROLES.GLOBAL_ADMIN, APP_ROLES.GROUP_MANAGER].includes(role),
		)
	) {
		can(RouteGuardActions.update, RouteGuardEntities.Group);
	}

	if (user?.roles.some((role) => [APP_ROLES.APPROVER].includes(role))) {
		can(RouteGuardActions.read, RouteGuardEntities.PersonalDashboard);
	}

	if (
		user?.roles.some((role) =>
			[
				APP_ROLES.GLOBAL_ADMIN,
				APP_ROLES.RECORD_MANAGER,
				APP_ROLES.APPROVER,
			].includes(role),
		)
	) {
		can(RouteGuardActions.read, RouteGuardEntities.Group);
	}

	if (
		user?.roles.some((role) =>
			[APP_ROLES.GLOBAL_ADMIN, APP_ROLES.RECORD_MANAGER].includes(role),
		)
	) {
		can(RouteGuardActions.manage, RouteGuardEntities.RdaAppSettings);
	}

	if (user?.roles.some((role) => [APP_ROLES.GLOBAL_ADMIN].includes(role))) {
		can(RouteGuardActions.manage, RouteGuardEntities.CoreAppSettings);
	}

	return build();
}
