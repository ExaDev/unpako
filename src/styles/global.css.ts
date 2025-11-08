import { globalStyle } from '@vanilla-extract/css';

globalStyle('*', {
	boxSizing: 'border-box',
	margin: 0,
	padding: 0,
});

globalStyle('html', {
	height: '100%',
});

globalStyle('body', {
	height: '100%',
	fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
	WebkitFontSmoothing: 'antialiased',
	MozOsxFontSmoothing: 'grayscale',
	backgroundColor: '#f8f9fa',
});

globalStyle('#root', {
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
});

globalStyle('code', {
	fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
});