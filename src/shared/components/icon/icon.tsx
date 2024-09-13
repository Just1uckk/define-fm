import React from 'react';
import styled from 'styled-components';
import { compose, space, SpaceProps } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { ReactComponent as Add } from 'shared/components/icon/collections/add.svg';
import { ReactComponent as ApproverApproved } from 'shared/components/icon/collections/approver-approved.svg';
import { ReactComponent as ApproverDeclined } from 'shared/components/icon/collections/approver-declined.svg';
import { ReactComponent as ApproverForced } from 'shared/components/icon/collections/approver-forced.svg';
import { ReactComponent as ArrowRoundLeft } from 'shared/components/icon/collections/arrow-arround-left.svg';
import { ReactComponent as ArrowDown } from 'shared/components/icon/collections/arrow-down.svg';
import { ReactComponent as ArrowFit } from 'shared/components/icon/collections/arrow-fit.svg';
import { ReactComponent as ArrowRight } from 'shared/components/icon/collections/arrow-right.svg';
import { ReactComponent as ArrowRound } from 'shared/components/icon/collections/arrow-round.svg';
import { ReactComponent as ArrowSwitch } from 'shared/components/icon/collections/arrow-switch.svg';
import { ReactComponent as ArrowUp } from 'shared/components/icon/collections/arrow-up.svg';
import { ReactComponent as Calendar } from 'shared/components/icon/collections/calendar.svg';
import { ReactComponent as Check } from 'shared/components/icon/collections/check.svg';
import { ReactComponent as CheckCircle } from 'shared/components/icon/collections/check-circle.svg';
import { ReactComponent as ChevronDown } from 'shared/components/icon/collections/chevron-down.svg';
import { ReactComponent as ChevronLeft } from 'shared/components/icon/collections/chevron-left.svg';
import { ReactComponent as ChevronRight } from 'shared/components/icon/collections/chevron-right.svg';
import { ReactComponent as ChevronTop } from 'shared/components/icon/collections/chevron-top.svg';
import { ReactComponent as Copy } from 'shared/components/icon/collections/copy.svg';
import { ReactComponent as Cross } from 'shared/components/icon/collections/cross.svg';
import { ReactComponent as Dashboard } from 'shared/components/icon/collections/dashboard.svg';
import { ReactComponent as Delete } from 'shared/components/icon/collections/delete.svg';
import { ReactComponent as Document } from 'shared/components/icon/collections/document.svg';
import { ReactComponent as DocumentApproved } from 'shared/components/icon/collections/document-approved.svg';
import { ReactComponent as DocumentDismiss } from 'shared/components/icon/collections/document-dismiss.svg';
import { ReactComponent as DocumentFeedback } from 'shared/components/icon/collections/document-feedback.svg';
import { ReactComponent as Edit } from 'shared/components/icon/collections/edit.svg';
import { ReactComponent as EmptyFolder } from 'shared/components/icon/collections/empty-folder.svg';
import { ReactComponent as EyeOff } from 'shared/components/icon/collections/eye-off.svg';
import { ReactComponent as EyeOn } from 'shared/components/icon/collections/eye-on.svg';
import { ReactComponent as DocFile } from 'shared/components/icon/collections/files/doc-file.svg';
import { ReactComponent as KeyFile } from 'shared/components/icon/collections/files/key-file.svg';
import { ReactComponent as PdfFile } from 'shared/components/icon/collections/files/pdf-file.svg';
import { ReactComponent as PptFile } from 'shared/components/icon/collections/files/ppt-file.svg';
import { ReactComponent as TextFile } from 'shared/components/icon/collections/files/text-file.svg';
import { ReactComponent as TxtFile } from 'shared/components/icon/collections/files/txt-file.svg';
import { ReactComponent as XlsFile } from 'shared/components/icon/collections/files/xls-file.svg';
import { ReactComponent as ZipFile } from 'shared/components/icon/collections/files/zip-file.svg';
import { ReactComponent as Filter } from 'shared/components/icon/collections/filter.svg';
import { ReactComponent as Folder } from 'shared/components/icon/collections/folder.svg';
import { ReactComponent as Home } from 'shared/components/icon/collections/home.svg';
import { ReactComponent as HorizontalLine } from 'shared/components/icon/collections/horizontal_line.svg';
import { ReactComponent as Info } from 'shared/components/icon/collections/info.svg';
import { ReactComponent as IconLeft } from 'shared/components/icon/collections/left.svg';
import { ReactComponent as LineRight } from 'shared/components/icon/collections/line_right.svg';
import { ReactComponent as Link } from 'shared/components/icon/collections/link.svg';
import { ReactComponent as ListBullet } from 'shared/components/icon/collections/list-bullet.svg';
import { ReactComponent as ListCard } from 'shared/components/icon/collections/list-card.svg';
import { ReactComponent as ListOrdered } from 'shared/components/icon/collections/list-ordered.svg';
import { ReactComponent as Logout } from 'shared/components/icon/collections/logout.svg';
import { ReactComponent as ManageColumns } from 'shared/components/icon/collections/manage-columns.svg';
import { ReactComponent as Minimize } from 'shared/components/icon/collections/minimize.svg';
import { ReactComponent as More } from 'shared/components/icon/collections/more.svg';
import { ReactComponent as MoreHorizontal } from 'shared/components/icon/collections/more_horizontal.svg';
import { ReactComponent as Multillang } from 'shared/components/icon/collections/multillang.svg';
import { ReactComponent as Navigation } from 'shared/components/icon/collections/navigation.svg';
import { ReactComponent as NoFiles } from 'shared/components/icon/collections/no_files.svg';
import { ReactComponent as NoFileSearchResult } from 'shared/components/icon/collections/no-file-search-result.svg';
import { ReactComponent as NotFound } from 'shared/components/icon/collections/not-found.svg';
import { ReactComponent as OrderDotsVertical } from 'shared/components/icon/collections/order-dots-vertical.svg';
import { ReactComponent as Play } from 'shared/components/icon/collections/play.svg';
import { ReactComponent as Records } from 'shared/components/icon/collections/records.svg';
import { ReactComponent as IconRight } from 'shared/components/icon/collections/right.svg';
import { ReactComponent as Search } from 'shared/components/icon/collections/search.svg';
import { ReactComponent as Settings } from 'shared/components/icon/collections/settings.svg';
import { ReactComponent as Shield } from 'shared/components/icon/collections/shield.svg';
import { ReactComponent as ShieldGear } from 'shared/components/icon/collections/shield-gear.svg';
import { ReactComponent as Substract } from 'shared/components/icon/collections/substract.svg';
import { ReactComponent as Sync } from 'shared/components/icon/collections/sync.svg';
import { ReactComponent as TextBold } from 'shared/components/icon/collections/text-bold.svg';
import { ReactComponent as TextCenter } from 'shared/components/icon/collections/text-center.svg';
import { ReactComponent as TextItalic } from 'shared/components/icon/collections/text-italic.svg';
import { ReactComponent as TextJustify } from 'shared/components/icon/collections/text-justify.svg';
import { ReactComponent as TextLeft } from 'shared/components/icon/collections/text-left.svg';
import { ReactComponent as TextRight } from 'shared/components/icon/collections/text-right.svg';
import { ReactComponent as TextUnderline } from 'shared/components/icon/collections/text-underline.svg';
import { ReactComponent as Dark } from 'shared/components/icon/collections/theme/dark.svg';
import { ReactComponent as Light } from 'shared/components/icon/collections/theme/light.svg';
import { ReactComponent as SystemTheme } from 'shared/components/icon/collections/theme/system_theme.svg';
import { ReactComponent as TriangleTop } from 'shared/components/icon/collections/triangle_top.svg';
import { ReactComponent as User } from 'shared/components/icon/collections/user.svg';
import { ReactComponent as UserAuth } from 'shared/components/icon/collections/user-auth.svg';
import { ReactComponent as UserGroup } from 'shared/components/icon/collections/user-group.svg';
import { ReactComponent as warning } from 'shared/components/icon/collections/warning.svg';
import { ReactComponent as XOctagon } from 'shared/components/icon/collections/x-octagon.svg';

export const ICON_COLLECTION = {
	icon_left: IconLeft,
	icon_right: IconRight,
	chevron_right: ChevronRight,
	chevron_down: ChevronDown,
	chevron_left: ChevronLeft,
	chevron_top: ChevronTop,
	home: Home,
	list_card: ListCard,
	minimize: Minimize,
	add: Add,
	check: Check,
	horizontal_line: HorizontalLine,
	search: Search,
	logout: Logout,
	settings: Settings,
	shield_gear: ShieldGear,
	records: Records,
	document: Document,
	document_dismiss: DocumentDismiss,
	document_approved: DocumentApproved,
	document_feedback: DocumentFeedback,
	filter: Filter,
	navigation: Navigation,
	dashboard: Dashboard,
	more: More,
	more_horizontal: MoreHorizontal,
	edit: Edit,
	copy: Copy,
	delete: Delete,
	user_group: UserGroup,
	user: User,
	user_auth: UserAuth,
	cross: Cross,
	order_dots_vertical: OrderDotsVertical,
	info: Info,
	arrow_round: ArrowRound,
	arrow_up: ArrowUp,
	arrow_down: ArrowDown,
	arrow_round_left: ArrowRoundLeft,
	arrow_right: ArrowRight,
	arrow_switch: ArrowSwitch,
	arrow_fit: ArrowFit,
	no_files: NoFiles,
	warning,
	link: Link,
	sync: Sync,
	text_bold: TextBold,
	text_italic: TextItalic,
	text_underline: TextUnderline,
	text_left: TextLeft,
	text_center: TextCenter,
	text_right: TextRight,
	text_justify: TextJustify,
	list_bullet: ListBullet,
	list_ordered: ListOrdered,
	doc_file: DocFile,
	txt_file: TxtFile,
	key_file: KeyFile,
	ppt_file: PptFile,
	zip_file: ZipFile,
	pdf_file: PdfFile,
	xls_file: XlsFile,
	text_file: TextFile,
	eye_on: EyeOn,
	eye_off: EyeOff,
	line_right: LineRight,
	triangle_top: TriangleTop,
	substract: Substract,
	calendar: Calendar,
	empty_folder: EmptyFolder,
	no_file_search_result: NoFileSearchResult,
	not_found: NotFound,
	x_octagon: XOctagon,
	check_circle: CheckCircle,
	manage_columns: ManageColumns,
	shield: Shield,
	play: Play,
	approver_forced: ApproverForced,
	approver_approved: ApproverApproved,
	approver_declined: ApproverDeclined,
	folder: Folder,
	multillang: Multillang,

	light: Light,
	dark: Dark,
	system_theme: SystemTheme,
};

type Keys = keyof typeof ICON_COLLECTION;
type IconType = (typeof ICON_COLLECTION)[Keys];

const IconWrapper = styled.span<ThemeProps & SpaceProps>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: ${({ theme }) => theme.icon.color};
	transition: color 0.05s ease;

	${compose(space)}
`;

export interface IconProps extends SpaceProps {
	className?: string;
	icon?: IconType;
}

export const Icon: React.FC<IconProps> = ({ className, icon, ...props }) => {
	if (!icon) return null;

	const Component = icon;

	return (
		<IconWrapper className={className} {...props}>
			<Component />
		</IconWrapper>
	);
};
