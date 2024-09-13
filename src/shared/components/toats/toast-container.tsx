import React from 'react';
import {
	cssTransition,
	ToastContainer as ToastContainerToastify,
} from 'react-toastify';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

const FadeAnimation = cssTransition({
	enter: 'fade-in-fwd',
	exit: 'fade-out-bck',
});

const FadeInAnimationFrame = keyframes`
  from {
    opacity: 0;
  }

   to {
     opacity: 1;
   }
`;

const FadeOutAnimationFrame = keyframes`
  from {
    opacity: 1;
  }

   to {
     opacity: 0;
   }
`;

const FadeAnimationGlobal = createGlobalStyle`
  .fade-in-fwd {
      animation: ${FadeInAnimationFrame} 0.2s ease both;
  }

  .fade-out-bck {
      animation: ${FadeOutAnimationFrame} 0.4s ease both;
  }
`;

const StyledToastContainer = styled(ToastContainerToastify)<ThemeProps>`
	width: 446px;
	margin-bottom: 0;
	z-index: 12;

	.Toastify__toast {
		padding: 0;
		margin-top: 1.2rem;
		min-height: initial;
		background: transparent;
		cursor: default;
	}

	.Toastify__toast-body {
		padding: 0;
	}
`;

export const ToastContainer: React.FC = () => {
	return (
		<>
			<StyledToastContainer
				toastClassName="site-toast"
				hideProgressBar
				closeButton={false}
				transition={FadeAnimation}
				closeOnClick={false}
				autoClose={3000}
				position="bottom-right"
			/>
			<FadeAnimationGlobal />
		</>
	);
};
