import React, { Component } from 'react';
import styled from 'styled-components';

import {
	defaultInitials,
	getRandomColor,
	parseSize,
	setGroupedTimeout,
} from 'shared/components/avatar/utils';
import { Image } from 'shared/components/image/image';

const StyledImage = styled(Image)<
	Pick<AvatarProps, 'round'> & { size: string }
>`
	max-width: 100%;
	width: ${({ size }) => size};
	height: ${({ size }) => size};
	border-radius: ${({ round }) =>
		round === true ? '100%' : (round as string)};
`;

const Wrapper = styled.div<Pick<AvatarProps, 'round'> & { size: string }>`
	display: inline-block;
	vertical-align: middle;
	width: ${({ size }) => size};
	height: ${({ size }) => size};
	border-radius: ${({ round }) =>
		round === true ? '100%' : (round as string)};
`;

const TextWrapper = styled.div<
	Pick<AvatarProps, 'round'> & { size: string; background: string }
>`
	width: ${({ size }) => size};
	height: ${({ size }) => size};
	line-height: initial;
	text-align: center;
	color: ${({ theme }) => theme.colors.white};
	background: ${({ background }) => background};
	filter: brightness(var(--avatar-brightness, 1));
	border-radius: ${({ round }) =>
		round === true ? '100%' : (round as string)};
`;

const TextTable = styled.div`
	display: table;
	table-layout: fixed;
	width: 100%;
	height: 100%;
`;

const TextTableCell = styled.div`
	display: table-cell;
	vertical-align: middle;
	font-size: 100%;
	white-space: nowrap;
`;

interface AvatarProps {
	className?: string;
	src?: string;
	name: string;
	alt: string;
	title: string;
	round: boolean | string;
	size: number | string;
	textSizeRatio: number;
	textMarginRatio: number;
	onClick: () => void;
}

interface AvatarState {
	src: string | null;
	color: string | null;
	value: string | null;
}

export class Avatar extends Component<AvatarProps, AvatarState> {
	private mounted: boolean | undefined;

	static defaultProps = {
		round: false,
		size: 100,
		textSizeRatio: 3,
		textMarginRatio: 0.15,
	};

	constructor(props) {
		super(props);

		this.state = {
			src: null,
			color: null,
			value: null,
		};
	}

	componentDidMount() {
		this.mounted = true;
		this._createFetcher();
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	componentDidUpdate(prevProps) {
		if (
			prevProps.src !== this.props.src ||
			prevProps.name !== this.props.name
		) {
			this._createFetcher();
		}
	}

	_createFetcher = () => {
		const nextState = {
			src: this.props.src || null,
			color: this.props.name ? getRandomColor(this.props.name) : null,
			value: this.props.name ? defaultInitials(this.props.name) : null,
		};

		this.setState(nextState);
	};

	_scaleTextNode = (node, retryTTL = 16) => {
		const { textSizeRatio, textMarginRatio } = this.props;

		if (!node || this.state.src || !this.mounted) return;

		const spanNode = node.parentNode;
		const tableNode = spanNode.parentNode;

		const { width: containerWidth, height: containerHeight } =
			spanNode.getBoundingClientRect();

		// Whenever the avatar element is not visible due to some CSS
		// (such as display: none) on any parent component we will check
		// whether the component has become visible.
		//
		// The time between checks grows up to half a second in an attempt
		// to reduce flicker / performance issues.
		if (containerWidth === 0 && containerHeight === 0) {
			const ttl = Math.min(retryTTL * 1.5, 500);
			setGroupedTimeout(() => this._scaleTextNode(node, ttl), ttl);
			return;
		}

		// If the tableNode (outer-container) does not have its fontSize set yet,
		// we'll set it according to "textSizeRatio"
		if (!tableNode.style.fontSize) {
			const baseFontSize = containerHeight / textSizeRatio;
			tableNode.style.fontSize = `${baseFontSize}px`;
		}

		// Reset font-size such that scaling works correctly (#133)
		spanNode.style.fontSize = null;

		// Measure the actual width of the text after setting the container size
		const { width: textWidth } = node.getBoundingClientRect();

		if (textWidth < 0) return;

		// Calculate the maximum width for the text based on "textMarginRatio"
		const maxTextWidth = containerWidth * (1 - 2 * textMarginRatio);

		// If the text is too wide, scale it down by (maxWidth / actualWidth)
		if (textWidth > maxTextWidth)
			spanNode.style.fontSize = `calc(1em * ${maxTextWidth / textWidth})`;
	};

	_renderAsImage() {
		const { className, round, alt, title, name } = this.props;
		const size = parseSize(this.props.size);

		return (
			<StyledImage
				className={className}
				size={size.str}
				round={round}
				src={this.state.src as string}
				alt={alt || name}
				title={title || name}
			/>
		);
	}

	_renderAsText() {
		const { className, round, title, name } = this.props;
		const size = parseSize(this.props.size);
		const key = this.props.size;

		return (
			<TextWrapper
				className={className}
				title={title || name}
				size={size.str}
				round={round}
				background={this.state.color as string}
			>
				<TextTable>
					<TextTableCell>
						<span ref={this._scaleTextNode} key={key}>
							{this.state.value}
						</span>
					</TextTableCell>
				</TextTable>
			</TextWrapper>
		);
	}

	render() {
		const { className, round, onClick } = this.props;
		const { src } = this.state;
		const size = parseSize(this.props.size);

		return (
			<Wrapper
				className={className}
				onClick={onClick}
				size={size.str}
				round={round}
			>
				{src ? this._renderAsImage() : this._renderAsText()}
			</Wrapper>
		);
	}
}
