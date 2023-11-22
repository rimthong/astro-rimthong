export type Image = {
    src: string;
    alt?: string;
};

export type Link = {
    href: string;
    text: string;
};

export type SocialLink = Link & {
    icon: 'codepen' | 'dev' | 'facebook' | 'github' | 'instagram' | 'linkedin' | 'medium' | 'x-twitter';
};

export type Hero = {
    title?: string;
    text?: string;
    avatar?: Image;
    backgroundImage?: Image;
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
};

export type SiteConfig = {
    logo?: Image;
    title: string;
    description: string;
    image?: Image;
    primaryNavLinks?: Link[];
    secondaryNavLinks?: Link[];
    socialLinks?: SocialLink[];
    hero?: Hero;
    subscribe?: Subscribe;
    postsPerPage?: number;
};

const siteConfig: SiteConfig = {
    title: 'Rimthong',
    description: 'Rimthong consulting and coaching, at your service.',
    image: {
        src: '/rimthong-preview.jpg',
        alt: 'Rimthong site'
    },
    primaryNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'Services',
            href: '/services'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Contact',
            href: '/contact'
        }
    ],
    secondaryNavLinks: [
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Services',
            href: '/services'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'Terms of Service',
            href: '/terms'
        },
        {
            text: 'Contact',
            href: '/contact'
        },
    ],
    socialLinks: [
        {
            text: 'Github',
            href: 'https://github.com/rimthong/',
            icon: 'github'
        },
        {
            text: 'Follow on Instagram',
            href: 'https://instagram.com/rimthong',
            icon: 'instagram'
        },
        {
            text: 'Follow on Linkedin',
            href: 'https://linkedin.com/in/rimthong',
            icon: 'linkedin'
        },
        {
            text: 'Follow on X',
            href: 'https://twitter.com/rimthong',
            icon: 'x-twitter'
        }
    ],
    hero: {
        title: 'Hi there!',
        text: "My name is Alex Rimthong, I like to coach high performing engineering teams, build innovative products and help people with their security. Catch me for a ☕️ or 🍺 in Montreal.",
        avatar: {
            src: '/profile.webp',
            alt: 'Alexandre Rimthong'
        },
        backgroundImage: {
            src: '/hero.webp'
        }
    },
    //subscribe: {
    //    title: 'Subscribe to the Rimthong Think Tank Newsletter',
    //    text: 'All the cool things I find, right in your inbox.',
    //    formUrl: 'https://justgoodthemes.us3.list-manage.com/subscribe/post?u=78f1bab16028354caeb23aecd&amp;id=4a7330d117&amp;f_id=005c48e2f0'
    //},
    postsPerPage: 5
};

export default siteConfig;
