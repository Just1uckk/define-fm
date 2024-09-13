import React, { forwardRef, useMemo, useState } from 'react';
import styled from 'styled-components';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	Input,
	InputIconButton,
	InputProps,
} from 'shared/components/input/input';

const StyledInput = styled(Input)`
	input {
		padding-right: 2.5rem;
	}
`;

const InputPasswordComponent: React.ForwardRefRenderFunction<
	HTMLInputElement,
	InputProps & { autoForward?: boolean }
> = (props, ref) => {
	const defaultPassword = '0000000000';
	const [isDisplayedPassword, setIsDisplayedPassword] = useState(false);
	const [value, setValue] = useState<string>(defaultPassword);
	const defaultValueFromProps = useMemo(() => {
		if (props.value && props.value.length) {
			return props.value;
		}

		return value;
	}, [props.value, value]);

	const toggleShowPassword = () =>
		setIsDisplayedPassword((prevValue) => !prevValue);
	const showIcon = useMemo(() => {
		if (props.autoForward) {
			if (value !== defaultPassword) {
				return (
					<InputIconButton
						icon={
							isDisplayedPassword
								? ICON_COLLECTION.eye_on
								: ICON_COLLECTION.eye_off
						}
						onPress={toggleShowPassword}
					/>
				);
			} else {
				return null;
			}
		} else {
			return (
				<InputIconButton
					icon={
						isDisplayedPassword
							? ICON_COLLECTION.eye_on
							: ICON_COLLECTION.eye_off
					}
					onPress={toggleShowPassword}
				/>
			);
		}
	}, [value]);

	return (
		<StyledInput
			ref={ref}
			{...props}
			type={isDisplayedPassword ? 'text' : 'password'}
			value={props.autoForward ? defaultValueFromProps : props.value}
			onFocus={() => {
				setValue('');
			}}
			icon={showIcon}
		/>
	);
};

export const InputPassword = forwardRef(InputPasswordComponent);
