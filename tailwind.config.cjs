const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
    theme: {
        extend: {
            boxShadow: {
                button: '0 0 1px 6px rgb(var(--color-primary) / 0.175)',
                avatar: '0 0 1px 11px rgb(var(--color-primary) / 0.15), 0 0 1px 22px rgb(var(--color-primary) / 0.10)'
            },
            colors: {
                primary: 'rgb(var(--color-primary) / <alpha-value>)'
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans]
            },
            typography: () => ({
                DEFAULT: {
                    css: {
                        a: {
                            color: 'rgb(var(--color-primary))',
                            '&:hover': {
                                'text-decoration': 'none'
                            }
                        },
                        'code::before': {
                            content: 'none'
                        },
                        'code::after': {
                            content: 'none'
                        },
                        code: {
                            backgroundColor: '#f1f5f9',
                            borderRadius: '0.25rem',
                            fontWeight: '500',
                            padding: '0.125rem 0.375rem'
                        },
                        'pre code': {
                            backgroundColor: 'transparent',
                            borderRadius: '0',
                            fontWeight: 'inherit',
                            padding: '0'
                        },
                        blockquote: {
                            border: 0,
                            fontSize: '1.3125em',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            lineHeight: 1.4,
                            paddingLeft: 0,
                            position: 'relative',
                            textAlign: 'center',
                            '&:before': {
                                backgroundColor: 'rgb(var(--color-primary))',
                                content: '""',
                                display: 'block',
                                height: '3px',
                                margin: '0 auto 30px',
                                width: '3.75rem'
                            },
                            '&:after': {
                                backgroundColor: 'rgb(var(--color-primary))',
                                content: '""',
                                display: 'block',
                                height: '3px',
                                margin: '30px auto 0',
                                width: '1.875rem'
                            },
                            '@media (min-width: theme("screens.sm"))': {
                                fontSize: '1.66667em',
                                lineHeight: 1.3
                            },
                            '@media (min-width: theme("screens.lg"))': {
                                marginLeft: '-6rem',
                                marginRight: '-6rem'
                            },
                            '@media (min-width: theme("screens.xl"))': {
                                marginLeft: '-10rem',
                                marginRight: '-10rem'
                            }
                        }
                    }
                },
                lg: {
                    css: {
                        blockquote: {
                            paddingLeft: 0
                        }
                    }
                }
            })
        }
    },
    plugins: [require('@tailwindcss/typography')]
};
