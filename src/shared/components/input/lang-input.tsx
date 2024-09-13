import React, {
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import update from 'immutability-helper';
import styled, { css } from 'styled-components';

import { selectCurrentUserLang } from 'app/store/user/user-selectors';

import { LanguageTypes } from 'shared/types/users';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Input, InputProps } from 'shared/components/input/input';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	row-gap: 1rem;
`;

const PrimaryInputWrapper = styled.div`
	display: flex;
`;

const CollapseButton = styled(IconButton)<{ isActive: boolean }>`
	width: 2.4rem;
	height: 2.4rem;
	margin-right: -0.95rem;

	${({ theme, isActive }) =>
		isActive &&
		css`
			color: ${theme.colors.accent};
		`}
`;

const InputList = styled.div<{ isCollapsed: boolean }>`
	position: static;
	display: flex;
	flex-direction: column;
	row-gap: 1rem;

	${({ isCollapsed }) =>
		isCollapsed &&
		css`
			position: absolute;
			top: 0;
			left: 0;
			height: 0;
			overflow: hidden;
			visibility: hidden;
		`}

	& > & {
		margin-top: 1rem;
	}
`;

const StyledInput = styled(Input)`
	flex-grow: 1;

	${CollapseButton} {
		position: absolute;
		top: 50%;
		right: 2px;
		margin-right: 0;
		transform: translateY(-50%);
	}
`;

const LangCode = styled.span`
	color: ${({ theme }) => theme.colors.accent};
`;

interface LangInputProps extends InputProps {
	lang?: LanguageTypes;
}

export const LangInputComponent: React.ForwardRefRenderFunction<
	HTMLInputElement,
	LangInputProps
> = ({ lang, icon, label, ...props }, ref) => {
	return (
		<StyledInput
			ref={ref}
			label={
				<>
					{label}{' '}
					{lang && (
						<LangCode>
							(<LocalTranslation tk={`language_abbreviation.${lang}`} />)
						</LangCode>
					)}
				</>
			}
			icon={<>{icon}</>}
			{...props}
		/>
	);
};

export const LangInput = forwardRef(LangInputComponent);

export interface LangInputListRef {
	expandIfHasError: () => void;
}

export const LangInputCode: React.FC<
	React.PropsWithChildren<{ lang: LanguageTypes; icon?: React.ReactNode }>
> = ({ lang, icon, children }) => {
	return React.isValidElement(children)
		? React.cloneElement<any>(children, {
				icon,
				label: (
					<span>
						{children.props.label}{' '}
						{lang && (
							<LangCode>
								(<LocalTranslation tk={`language_abbreviation.${lang}`} />)
							</LangCode>
						)}
					</span>
				),
		  })
		: null;
};

export const LangInputList: React.FC<{
	innerRef?: React.MutableRefObject<LangInputListRef | undefined>;
	children:
		| React.ReactElement<LangInputProps>
		| React.ReactElement<LangInputProps>[];
}> = ({ innerRef, children }) => {
	const userCurrentLang = selectCurrentUserLang();
	const [isCollapsed, setIsCollapsed] = useState(true);
	const restInputListRef = useRef() as React.RefObject<HTMLDivElement>;
	const primaryInputRef = useRef() as React.RefObject<HTMLDivElement>;

	useImperativeHandle(innerRef, () => ({
		expandIfHasError,
	}));

	const isChildrenArray = Array.isArray(children);
	const primaryInputIdx = isChildrenArray
		? children.findIndex((input) => input.props.lang === userCurrentLang)
		: -1;

	const primaryInput =
		isChildrenArray && primaryInputIdx > -1
			? children.slice(primaryInputIdx, primaryInputIdx + 1)[0]
			: null;

	const modifiedPrimaryInput = React.isValidElement(primaryInput)
		? React.cloneElement(primaryInput, {
				lang: undefined,
				icon: (
					<CollapseButton
						icon={ICON_COLLECTION.multillang}
						isActive={!isCollapsed}
						onPress={toggleMenu}
					/>
				),
		  })
		: null;

	const restInputs =
		isChildrenArray && primaryInput
			? update(children, { $splice: [[primaryInputIdx, 1]] })
			: [];

	function toggleMenu() {
		setIsCollapsed((prevValue) => {
			const newValue = !prevValue;

			setTimeout(() => {
				const list = newValue
					? primaryInputRef.current
					: restInputListRef.current;
				const input = list?.querySelector('input');

				input?.focus();
			}, 0);

			return newValue;
		});
	}

	function expandIfHasError() {
		const hasErrorInRestList =
			isChildrenArray && !!restInputs.find((input) => !!input.props.error);

		if (!hasErrorInRestList) return;

		setIsCollapsed(false);
	}

	return (
		<Wrapper>
			<PrimaryInputWrapper ref={primaryInputRef}>
				{modifiedPrimaryInput}
			</PrimaryInputWrapper>
			<InputList ref={restInputListRef} isCollapsed={isCollapsed}>
				{restInputs}
			</InputList>
		</Wrapper>
	);
};
