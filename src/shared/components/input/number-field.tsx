import React, { forwardRef } from 'react';
import { AriaNumberFieldProps, useLocale, useNumberField } from 'react-aria';
import { useNumberFieldState } from 'react-stately';
import mergeRefs from 'shared/utils/merge-refs';
import styled from 'styled-components';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { BaseInput, BaseInputProps } from 'shared/components/input/base-input';

const Actions = styled.div`
	position: absolute;
	top: 50%;
	right: 10px;
	transform: translateY(-50%);
`;

const Button = styled(IconButton)`
	width: 1.3rem;
	height: 1.3rem;
	border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const IncrementButton = styled(Button)`
	svg {
		width: 13px;
		height: 13px;
	}
`;

const DecrementButton = styled(Button)`
	svg {
		width: 13px;
		height: 2px;
	}
`;

interface NumberFieldProps
	extends AriaNumberFieldProps,
		Pick<BaseInputProps, 'label' | 'fulfilled'> {}

const _NumberField: React.ForwardRefRenderFunction<
	HTMLInputElement,
	NumberFieldProps
> = ({ ...props }, ref) => {
	const { locale } = useLocale();
	const state = useNumberFieldState({ ...props, locale });
	const localRef = React.useRef(null);
	const {
		labelProps,
		groupProps,
		inputProps,
		incrementButtonProps,
		decrementButtonProps,
	} = useNumberField(props, state, localRef);

	return (
		<div {...groupProps}>
			<BaseInput
				ref={mergeRefs(localRef, ref)}
				label={props.label}
				labelProps={labelProps}
				{...inputProps}
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				error={props.errorMessage}
				iconRight={
					<Actions>
						<IncrementButton
							icon={ICON_COLLECTION.add}
							{...incrementButtonProps}
						/>
						<DecrementButton
							icon={ICON_COLLECTION.substract}
							{...decrementButtonProps}
						/>
					</Actions>
				}
			/>
		</div>
	);
};

export const NumberField = forwardRef(_NumberField);
