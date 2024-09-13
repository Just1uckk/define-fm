import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { uuid } from 'shared/utils/uuid';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Text } from 'shared/components/text/text';
import { Editor } from 'shared/components/text-editor/components/editor';
import { Toolbar } from 'shared/components/text-editor/components/toolbar';

import 'react-quill/dist/quill.bubble.css';

const Wrapper = styled.div<ThemeProps>``;

const EditorWrapper = styled.div<ThemeProps>`
	position: relative;
	padding: 0.5rem 1rem;
	box-sizing: border-box;
	background: ${({ theme }) => theme.input.bg};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	border: 1px solid ${({ theme }) => theme.input.borderColor};

	&.has-error {
		border-color: ${({ theme }) => theme.colors.error};
	}
`;

const Label = styled.label`
	position: relative;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.75rem;
	font-size: 0.6875rem;
	line-height: 0.875rem;
	color: ${({ theme }) => theme.input.labelColor};
	text-align: left;
`;

const StyledError = styled(Text)<ThemeProps>`
	padding: 0 1rem;
	margin-top: 0.25rem;
`;

interface TextEditorProps {
	className?: string;
	label?: string;
	value?: string;
	error?: React.ReactNode;
	icon?: React.ReactNode;
	onChange: (value: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
	className,
	label,
	value = '',
	error,
	icon,
	onChange,
}) => {
	const editorRef = useRef<any | null>(null);

	const { t: translation } = useTranslation('translation');

	const handleChange = (html) => {
		onChange(html);
	};

	const uniqueHash = useMemo(() => `ql-${uuid()}`, []);
	const modules = useMemo(
		() => ({ toolbar: { container: `#${uniqueHash}` } }),
		[uniqueHash],
	);

	return (
		<Wrapper className={className}>
			<EditorWrapper
				data-text-editor={uniqueHash}
				className={clsx({ 'has-error': !!error })}
			>
				{label && (
					<Label>
						{label} {icon}
					</Label>
				)}
				<Toolbar editor={editorRef.current?.editor} id={uniqueHash} />
				<Editor
					ref={editorRef}
					value={value}
					modules={modules}
					bounds={`[data-text-editor="${uniqueHash}"] > .quill`}
					translation={translation('components.text_editor.link-tooltip', {
						returnObjects: true,
					})}
					onChange={handleChange}
				/>
			</EditorWrapper>

			{error && <StyledError variant="body_6_error">{error}</StyledError>}
		</Wrapper>
	);
};
