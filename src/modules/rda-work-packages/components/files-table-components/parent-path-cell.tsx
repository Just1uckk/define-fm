import React, { useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useQuery } from 'react-query';
import { parseFileFullPath } from 'shared/utils/parse-file-full-path';
import styled from 'styled-components';

import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';

import { ThemeProps } from 'app/settings/theme/theme';

import { IFile } from 'shared/types/dispositions';

import { WORK_PACKAGE_FILES_KEYS } from 'shared/constants/query-keys';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Spinner } from 'shared/components/spinner/spinner';
import { Tooltip } from 'shared/components/tooltip/tooltip';

const LocationIcon = styled(Icon)`
	margin-right: 0.75rem;
`;

const StyledSpinner = styled(Spinner)`
	width: 1rem;
	height: 1rem;
	color: currentColor;
	margin-bottom: 0.3rem;
`;

const Breadcrumbs = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin-top: -0.3rem;
	font-size: 0.625rem;
	line-height: 0.75rem;
`;

const Breadcrumb = styled.div<ThemeProps>`
	position: relative;
	padding-right: 1rem;
	margin-right: 0.3rem;
	margin-top: 0.3rem;
`;

const BreadcrumbSeparator = styled(Icon)`
	position: absolute;
	top: 2px;
	right: 2px;
	color: currentColor;

	svg {
		width: 4px;
		height: 8px;
	}
`;

const LocationLink = styled.a`
	color: ${({ theme }) => theme.colors.primary};
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 200px;
	height: 1.2em;
	white-space: nowrap;
`;

interface ParentPathCellProps {
	fileId: IFile['id'];
	fileName: IFile['name'];
	parentName: IFile['parent'];
	parentPath?: any;
}

export const ParentPathCell: React.FC<ParentPathCellProps> = ({
	fileId,
	fileName,
	parentName,
	parentPath,
}) => {
	const hoverTimer = useRef<any>();

	const managePopperState = useManagePopperState({
		placement: 'top',
	});

	const fullPath = useMemo(() => {
		if (parentPath) {
			const path = parentPath[fileId];
			if (path) {
				const rightPath = path.split(':');
				return rightPath.slice(0, -1);
			} else return undefined;
		}
		return undefined;
	}, [parentPath]);

	useEffectAfterMount(() => {
		managePopperState.update?.();
	}, [fullPath]);

	const handleMouseEnter = () => {
		hoverTimer.current = setTimeout(
			() => managePopperState.toggleMenu(true),
			700,
		);
	};
	const handleMouseLeave = () => {
		clearTimeout(hoverTimer.current);
		managePopperState.toggleMenu(false);
	};

	return (
		<>
			<LocationIcon icon={ICON_COLLECTION.folder} />
			<LocationLink
				ref={(ref) => managePopperState?.setReferenceElement(ref)}
				href={parentPath}
				target="_blank"
				rel="noreferrer"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{fullPath?.length ? fullPath[fullPath.length - 1] : <StyledSpinner />}
			</LocationLink>

			{managePopperState.isOpen &&
				ReactDOM.createPortal(
					<Tooltip
						ref={(ref) => managePopperState.setPopperElement(ref)}
						style={managePopperState.styles.popper}
						{...managePopperState.attributes.popper}
						arrowRef={managePopperState.setArrowElement}
						arrowStyles={managePopperState.styles.arrow}
					>
						{!fullPath?.length && <StyledSpinner />}
						<Breadcrumbs>
							{fullPath?.map((path, idx, self) => (
								<Breadcrumb key={idx}>
									{path}
									{idx < self.length - 1 && (
										<BreadcrumbSeparator icon={ICON_COLLECTION.chevron_right} />
									)}
								</Breadcrumb>
							))}
						</Breadcrumbs>
					</Tooltip>,
					document.body,
				)}
		</>
	);
};
