import React, { useEffect, useState } from 'react';
import { Quill } from 'react-quill';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Button } from 'shared/components/text-editor/components/button';
import { TextSelect } from 'shared/components/text-editor/components/text-select';

const Wrapper = styled.div<ThemeProps>`
	display: flex;
	align-items: center;
	padding: 0.25rem;
	background: ${({ theme }) => theme.input.bg};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	border: 1px solid ${({ theme }) => theme.input.borderColor};
	box-sizing: border-box;

	& > * {
		margin: 0 0.25rem;
	}
`;

const Separator = styled.span`
	display: block;
	flex-shrink: 0;
	height: 1rem;
	width: 0.0625rem;
	background-color: ${({ theme }) =>
		theme.textEditor.toolbarItem.separatorColor};
`;

const icons = Quill.import('ui/icons');
icons.align = null;
icons.list = null;
icons.link = null;
icons.bold = null;
icons.underline = null;
icons.italic = null;

export type TextTypes = 'header_1' | 'header_2' | 'header_3' | 'paragraph';

export interface IOpionTextType {
	name: string;
	label: string;
	value: TextTypes;
}

const SET_TYPE_TEXT: Record<TextTypes, (editor: any) => void> = {
	paragraph: (editor) =>
		editor.format('header', false, editor.selection.getRange()),
	header_1: (editor) => editor.format('header', 1, editor.selection.getRange()),
	header_2: (editor) => editor.format('header', 2, editor.selection.getRange()),
	header_3: (editor) => editor.format('header', 3, editor.selection.getRange()),
};

const OPTIONS_TEXT_TYPE: IOpionTextType[] = [
	{ name: 'typeText', label: 'Heading 1', value: 'header_1' },
	{ name: 'typeText', label: 'Heading 2', value: 'header_2' },
	{ name: 'typeText', label: 'Heading 3', value: 'header_3' },
	{ name: 'typeText', label: 'Paragraph', value: 'paragraph' },
];

interface ToolbarProps {
	id: string;
	editor: any;
}

export const Toolbar: React.FC<ToolbarProps> = ({ id, editor }) => {
	const [selectedTextType, setSelectedTextType] =
		useState<TextTypes>('paragraph');

	const onChangeTypeText = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		SET_TYPE_TEXT[value](editor);
	};

	useEffect(() => {
		if (!editor) return;

		const onChangeSelection = () => {
			if (!editor.hasFocus()) return;

			const textType = editor.getFormat(editor.getSelection(false));
			if ('header' in textType) {
				const findType = OPTIONS_TEXT_TYPE.find(
					(el) => el.value === `header_${textType.header}`,
				)?.value;

				if (findType && selectedTextType !== findType)
					setSelectedTextType(findType);
				if (!findType && selectedTextType !== 'paragraph')
					setSelectedTextType('paragraph');
			} else if (selectedTextType !== 'paragraph')
				setSelectedTextType('paragraph');
		};

		editor.on('editor-change', onChangeSelection);
		return () => {
			editor.off('editor-change', onChangeSelection);
		};
	}, [editor, selectedTextType]);

	return (
		<Wrapper id={id} className="ql-toolbar">
			<TextSelect
				value={selectedTextType}
				options={OPTIONS_TEXT_TYPE}
				onChange={onChangeTypeText}
			/>
			<Button className="ql-bold" icon={ICON_COLLECTION.text_bold} />
			<Button className="ql-italic" icon={ICON_COLLECTION.text_italic} />
			<Button className="ql-underline" icon={ICON_COLLECTION.text_underline} />
			<Separator />
			<Button className="ql-align" value="" icon={ICON_COLLECTION.text_left} />
			<Button
				className="ql-align"
				value="center"
				icon={ICON_COLLECTION.text_center}
			/>
			<Button
				className="ql-align"
				value="right"
				icon={ICON_COLLECTION.text_right}
			/>
			<Button
				className="ql-align"
				value="justify"
				icon={ICON_COLLECTION.text_justify}
			/>
			<Separator />
			<Button
				className="ql-list"
				value="bullet"
				icon={ICON_COLLECTION.list_bullet}
			/>
			<Button
				className="ql-list"
				value="ordered"
				icon={ICON_COLLECTION.list_ordered}
			/>
			<Button className="ql-link" value="link" icon={ICON_COLLECTION.link} />
		</Wrapper>
	);
};
