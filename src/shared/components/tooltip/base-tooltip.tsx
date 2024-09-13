import React from 'react';
import ReactDOM from 'react-dom';

import {
	useManagePopperState,
	UseManagePopperStateProps,
} from 'shared/hooks/use-manage-popper-state';

import { Tooltip } from 'shared/components/tooltip/tooltip';

export interface BaseTooltipProps
	extends Pick<UseManagePopperStateProps, 'placement' | 'fallbackPlacements'> {
	text: React.ReactNode;
	target: JSX.Element;
	blocked?: boolean;
}

export const BaseTooltip: React.FC<BaseTooltipProps> = ({
	placement,
	fallbackPlacements,
	text,
	target,
	blocked,
}) => {
	const managePopperState = useManagePopperState({
		placement,
		fallbackPlacements,
	});

	const trigger = React.cloneElement(target, {
		ref: (ref) => managePopperState.setReferenceElement(ref),
		onMouseLeave: (e: React.MouseEvent) => {
			target.props.onMouseEnter && target.props.onMouseEnter(e);
			managePopperState.toggleMenu(false);
		},
		onMouseEnter: (e: React.MouseEvent) => {
			target.props.onMouseLeave && target.props.onMouseLeave(e);
			managePopperState.toggleMenu(true);
		},
		onFocus: (e: React.MouseEvent) => {
			target.props.onFocus && target.props.onFocus(e);
			managePopperState.toggleMenu(true);
		},
		onBlur: (e: React.MouseEvent) => {
			target.props.onBlur && target.props.onBlur(e);
			managePopperState.toggleMenu(false);
		},
	});

	return (
		<>
			{trigger}
			{!blocked &&
				managePopperState.isOpen &&
				ReactDOM.createPortal(
					<Tooltip
						ref={(ref) => managePopperState.setPopperElement(ref)}
						style={managePopperState.styles.popper}
						{...managePopperState.attributes.popper}
						arrowRef={managePopperState.setArrowElement}
						arrowStyles={managePopperState.styles.arrow}
					>
						{text}
					</Tooltip>,
					document.body,
				)}
		</>
	);
};
