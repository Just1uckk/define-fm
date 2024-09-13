import React, {
	DragEvent,
	forwardRef,
	InputHTMLAttributes,
	useRef,
	useState,
} from 'react';
import clsx from 'clsx';
import mergeRefs from 'shared/utils/merge-refs';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useImageCropper } from 'shared/hooks/use-image-cropper';
import { useTranslation } from 'shared/hooks/use-translation';

import { Text } from 'shared/components/text/text';

const Wrapper = styled.label`
	position: relative;
`;

const Inner = styled.div<ThemeProps>`
	position: relative;
	min-height: 4rem;
	padding: 0.625rem 1rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: ${({ theme }) => theme.dropzone.bg};
	border: 0.0625rem dashed ${({ theme }) => theme.dropzone.borderColor};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	transition: background-color 0.3s ease;
	cursor: pointer;

	&:hover,
	&.is-dragging {
		border-style: solid;
		background-color: ${({ theme }) => theme.dropzone.active.bg};
	}
`;

const FileInput = styled.input<ThemeProps>`
	position: absolute;
	clip: rect(0 0 0 0);
	width: 1px;
	height: 1px;
	margin: -1px;

	&:focus-visible ~ ${Inner} {
		border-style: solid;
		background-color: ${({ theme }) => theme.dropzone.active.bg};
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
	}
`;

const DropzoneLabel = styled(Text)<ThemeProps>`
	& span {
		color: ${({ theme }) => theme.dropzone.color};
	}
`;

const DropzoneError = styled(Text)<ThemeProps>`
	margin-top: 0.5rem;
`;

export enum DropzoneErrors {
	MAX_SIZE = 'MAX_SIZE',
	TYPE = 'TYPE',
}

export interface FileInvalidDropzone {
	file: File;
	erorrs: string[];
}

interface DropzoneProps {
	useCropper?: typeof useImageCropper;
	name?: InputHTMLAttributes<HTMLInputElement>['name'];
	label?: React.ReactNode;
	accept?: Array<string>;
	multiple?: boolean;
	maxSize?: number; //in bytes
	errorMessage?: React.ReactNode;
	onChange: (files: File[]) => void;
	onError: (files: FileInvalidDropzone[]) => void;
}

const DropzoneComponent: React.ForwardRefRenderFunction<
	HTMLInputElement,
	DropzoneProps
> = (
	{
		useCropper,
		name,
		label,
		accept,
		multiple = true,
		maxSize,
		errorMessage,
		onChange,
		onError,
	},
	ref,
) => {
	const cropper = useCropper?.({
		onChange: (file) => onChange([file]),
	});
	const { t } = useTranslation();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const dragCounter = useRef<number>(0);
	const [isDragging, setIsDragging] = useState<boolean>(false);

	const filesSelected = () => {
		if (fileInputRef?.current?.files?.length) {
			handleFiles(fileInputRef.current.files);
		}
	};

	const checkTypeFile = (file: File) => {
		return !(accept?.indexOf(file.type) === -1);
	};

	const checkFileSize = (file: File) => {
		return !maxSize ? true : file.size <= maxSize;
	};

	const validateFiles = (files: FileList) => {
		const validFiles: File[] = [];
		const invalidFiles: FileInvalidDropzone[] = [];

		for (let i = 0; i < files.length; i++) {
			const file: FileInvalidDropzone = {
				file: files[i],
				erorrs: [],
			};

			if (!checkTypeFile(files[i])) {
				file.erorrs.push(DropzoneErrors.TYPE);
			}
			if (!checkFileSize(files[i])) {
				file.erorrs.push(DropzoneErrors.MAX_SIZE);
			}

			if (file.erorrs.length) invalidFiles.push(file);
			else validFiles.push(files[i]);
		}

		return {
			validFiles: validFiles,
			invalidFiles: invalidFiles,
		};
	};

	const handleFiles = (files: FileList) => {
		const { validFiles, invalidFiles } = validateFiles(files);

		if (validFiles.length) {
			if (cropper) {
				cropper.onOpen(URL.createObjectURL(validFiles[0]));
			} else {
				onChange(validFiles);
			}
		}
		if (invalidFiles.length) onError(invalidFiles);
		clearInput();
	};

	function clearInput() {
		if (!fileInputRef.current) return;
		fileInputRef.current.value = '';
	}

	const preventDefault = (event: DragEvent<HTMLElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const dragOver = (event: DragEvent<HTMLLabelElement>) => {
		preventDefault(event);
	};

	const dragEnter = (event: DragEvent<HTMLLabelElement>) => {
		preventDefault(event);
		dragCounter.current++;
		if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
			setIsDragging(true);
		}
	};

	const dragLeave = (event: DragEvent<HTMLLabelElement>) => {
		preventDefault(event);
		dragCounter.current--;
		if (dragCounter.current > 0) return;
		setIsDragging(false);
	};

	const fileDrop = (event: DragEvent<HTMLLabelElement>) => {
		preventDefault(event);
		setIsDragging(false);
		const files = event.dataTransfer.files;
		if (files.length) {
			handleFiles(files);
			dragCounter.current = 0;
		}
	};

	return (
		<>
			{cropper?.modal}

			<Wrapper
				onDragOver={dragOver}
				onDragEnter={dragEnter}
				onDragLeave={dragLeave}
				onDrop={fileDrop}
			>
				<FileInput
					ref={mergeRefs(fileInputRef, ref)}
					name={name}
					type="file"
					accept={accept?.join(', ')}
					multiple={multiple}
					onChange={filesSelected}
				/>
				<Inner className={clsx({ 'is-dragging': isDragging })}>
					<DropzoneLabel variant="body_2_secondary">
						{label ? (
							label
						) : (
							<div
								dangerouslySetInnerHTML={{
									__html: t('components.dropzone.subscription'),
								}}
							/>
						)}
					</DropzoneLabel>
					{errorMessage && (
						<DropzoneError tag="div" variant="body_6_error">
							{errorMessage}
						</DropzoneError>
					)}
				</Inner>
			</Wrapper>
		</>
	);
};

export const Dropzone = forwardRef(DropzoneComponent);
