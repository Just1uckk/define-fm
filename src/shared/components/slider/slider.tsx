import React, { RefObject } from 'react';
import {
	AriaSliderProps,
	mergeProps,
	useFocusRing,
	useNumberFormatter,
	useSlider,
	useSliderThumb,
	VisuallyHidden,
} from 'react-aria';
import { SliderState, useSliderState } from 'react-stately';
import { NumberFormatOptions } from '@internationalized/number';
import { AriaSliderThumbProps } from '@react-types/slider';
import clsx from 'clsx';
import styled from 'styled-components';

const SliderContainer = styled.div`
	display: flex;

	&.horizontal {
		width: 100%;
		flex-direction: column;
	}

	& .track {
		height: 30px;
		width: 100%;
	}

	& .track:before {
		content: attr(x);
		position: absolute;
		display: block;
		background-color: #e9e9e9;
		border-radius: ${({ theme }) => theme.borderRadius.base};
	}

	&.horizontal .track:before {
		height: 4px;
		width: 100%;
		top: 50%;
		transform: translateY(-50%);
	}

	& .thumb {
		width: 14px;
		height: 14px;
		background-color: ${({ theme }) => theme.colors.accent};
		border-radius: 50%;
		cursor: grab;

		&.focus {
			outline: rgb(16, 16, 16) auto 1px;
			outline: -webkit-focus-ring-color auto 1px;
			outline-offset: 2px;
		}
	}

	&.horizontal .thumb {
		top: 50%;
	}
`;

interface SliderProps extends AriaSliderProps {
	className?: string;
	formatOptions?: NumberFormatOptions;
}

export const Slider: React.FC<SliderProps> = (props) => {
	const trackRef = React.useRef(null);
	const numberFormatter = useNumberFormatter(props.formatOptions);
	const state = useSliderState({ ...props, numberFormatter });
	const { groupProps, trackProps, labelProps, outputProps } = useSlider(
		props,
		state,
		trackRef,
	);

	return (
		<SliderContainer
			{...groupProps}
			className={clsx('slider', props.className, state.orientation)}
		>
			{props.label && (
				<div className="label-container">
					<label {...labelProps}>{props.label}</label>
					<output {...outputProps}>{state.getThumbValueLabel(0)}</output>
				</div>
			)}

			<div
				{...trackProps}
				ref={trackRef}
				className={`track ${state.isDisabled ? 'disabled' : ''}`}
			>
				<Thumb index={0} state={state} trackRef={trackRef} />
			</div>
		</SliderContainer>
	);
};

interface ThumbProps extends AriaSliderThumbProps {
	state: SliderState;
	trackRef: RefObject<Element>;
}

const Thumb: React.FC<ThumbProps> = (props) => {
	const { state, trackRef, index } = props;
	const inputRef = React.useRef(null);
	const { thumbProps, inputProps, isDragging } = useSliderThumb(
		{
			index,
			trackRef,
			inputRef,
		},
		state,
	);

	const { focusProps, isFocusVisible } = useFocusRing();
	return (
		<div
			{...thumbProps}
			className={`thumb ${isFocusVisible ? 'focus' : ''} ${
				isDragging ? 'dragging' : ''
			}`}
		>
			<VisuallyHidden>
				<input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
			</VisuallyHidden>
		</div>
	);
};
