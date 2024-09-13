import React from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

const Wrapper = styled.div<ThemeProps>`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 3px;
	z-index: 11;

	&.active {
		background-color: ${({ theme }) => theme.colors.grey.style_1};
	}
`;

const Loader = styled.div<ThemeProps>`
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	background-color: ${({ theme }) => theme.colors.accent};
`;

type Mode = 'hibernate' | 'init' | 'active' | 'complete' | 'inactive';

interface Props {
	className?: string;
	container?: Element | DocumentFragment;
	active?: boolean;
}

interface State {
	mode: Mode;
}

export class FetchLoader extends React.PureComponent<Props, State> {
	protected timer;

	public state: Readonly<State> = {
		mode: 'init',
	};

	public componentDidUpdate(
		prevProps: Readonly<Props>,
		prevState: Readonly<State>,
	) {
		if (prevProps.active !== this.props.active) {
			if (!prevProps.active && this.props.active) {
				this.setState({ mode: 'active' });
			} else if (prevProps.active && !this.props.active) {
				this.setState({ mode: 'complete' });

				this.timer = setTimeout(() => {
					this.setState({ mode: 'init' });
				}, 300);
			}
		}
	}

	public componentWillUnmount() {
		clearTimeout(this.timer);
	}

	public render(): React.ReactNode {
		const mode = this.state.mode;

		const container = this.props.container || document.body;
		let width = 100;
		let animationSpeed = 0.3;

		if (mode === 'active') {
			width = 75;
			animationSpeed = 0.5;
		}
		if (mode === 'init') {
			width = 0;
			animationSpeed = 0;
		}

		const transition = `width ${animationSpeed}s ease-in`;

		const style: React.CSSProperties = {
			transition,
			width: `${width}%`,
		};

		return ReactDOM.createPortal(
			<Wrapper
				className={clsx(this.props.className, { active: mode === 'active' })}
			>
				<Loader style={style} />
			</Wrapper>,
			container,
		);
	}
}
