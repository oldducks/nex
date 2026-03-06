--
-- PostgreSQL database dump
--

\restrict dAKmQ09eEyeV9PAm1odcBhAFe66QfSojTObTPu6fZblzRSPaOqFRya4a85g3LzL

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: analytics_logs_action_enum; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.analytics_logs_action_enum AS ENUM (
    'VIEW_PROFILE',
    'DOWNLOAD_VCF',
    'VIEW_CATALOG',
    'DOWNLOAD_PDF'
);


ALTER TYPE public.analytics_logs_action_enum OWNER TO admin;

--
-- Name: orders_status_enum; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.orders_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.orders_status_enum OWNER TO admin;

--
-- Name: referrals_status_enum; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.referrals_status_enum AS ENUM (
    'pending',
    'confirmed',
    'paid'
);


ALTER TYPE public.referrals_status_enum OWNER TO admin;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.users_role_enum AS ENUM (
    'super_admin',
    'group_admin',
    'user'
);


ALTER TYPE public.users_role_enum OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analytics_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.analytics_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    visitor_id character varying,
    action public.analytics_logs_action_enum NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.analytics_logs OWNER TO admin;

--
-- Name: analytics_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.analytics_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.analytics_logs_id_seq OWNER TO admin;

--
-- Name: analytics_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.analytics_logs_id_seq OWNED BY public.analytics_logs.id;


--
-- Name: catalogs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.catalogs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    pdf_url character varying,
    layout_config jsonb,
    interactive_links jsonb,
    custom_slug character varying,
    is_active boolean DEFAULT true NOT NULL,
    category character varying,
    video_config jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.catalogs OWNER TO admin;

--
-- Name: catalogs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.catalogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.catalogs_id_seq OWNER TO admin;

--
-- Name: catalogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.catalogs_id_seq OWNED BY public.catalogs.id;


--
-- Name: landing_pages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.landing_pages (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying NOT NULL,
    description text,
    content_blocks jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    theme_config jsonb,
    seo_metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.landing_pages OWNER TO admin;

--
-- Name: landing_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.landing_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.landing_pages_id_seq OWNER TO admin;

--
-- Name: landing_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.landing_pages_id_seq OWNED BY public.landing_pages.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    owner_id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    occupation character varying,
    message text NOT NULL,
    pdpa_consent boolean DEFAULT true NOT NULL,
    consent_timestamp timestamp without time zone NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leads OWNER TO admin;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leads_id_seq OWNER TO admin;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    package_name character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    duration_days integer NOT NULL,
    status public.orders_status_enum DEFAULT 'pending'::public.orders_status_enum NOT NULL,
    slip_url character varying,
    reject_reason character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO admin;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO admin;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.products (
    id integer NOT NULL,
    catalog_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying,
    price numeric(10,2),
    images_json jsonb DEFAULT '[]'::jsonb NOT NULL,
    interactive_links jsonb,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO admin;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO admin;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.profiles (
    user_id integer NOT NULL,
    full_name character varying(100),
    "position" character varying(100),
    company_name character varying(100),
    names_i18n jsonb DEFAULT '[]'::jsonb NOT NULL,
    positions_i18n jsonb DEFAULT '[]'::jsonb NOT NULL,
    companies_i18n jsonb DEFAULT '[]'::jsonb NOT NULL,
    emails jsonb DEFAULT '[]'::jsonb NOT NULL,
    phones jsonb DEFAULT '[]'::jsonb NOT NULL,
    mobile character varying(20),
    email_contact character varying(100),
    line_id character varying(50),
    website character varying(255),
    address text,
    profile_pic jsonb,
    profile_pic_url text,
    logo jsonb,
    backgrounds jsonb DEFAULT '[]'::jsonb NOT NULL,
    banners jsonb DEFAULT '[]'::jsonb NOT NULL,
    cover_pic_url text,
    websites jsonb DEFAULT '[]'::jsonb NOT NULL,
    about_me text,
    interests jsonb DEFAULT '[]'::jsonb NOT NULL,
    layout_config jsonb,
    theme_color character varying(10),
    card_design_json jsonb,
    social_links_json jsonb DEFAULT '[]'::jsonb NOT NULL,
    theme_config jsonb,
    profile_pic_position jsonb DEFAULT '{"x": 50, "y": 50, "scale": 1}'::jsonb,
    video_url text,
    video_config jsonb,
    gallery jsonb DEFAULT '[]'::jsonb NOT NULL
);


ALTER TABLE public.profiles OWNER TO admin;

--
-- Name: referrals; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.referrals (
    id integer NOT NULL,
    referrer_id integer NOT NULL,
    referred_id integer NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    commission_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    commission_rate numeric(5,2) DEFAULT '10'::numeric NOT NULL,
    status public.referrals_status_enum DEFAULT 'pending'::public.referrals_status_enum NOT NULL,
    registration_fee numeric(10,2),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.referrals OWNER TO admin;

--
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.referrals_id_seq OWNER TO admin;

--
-- Name: referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.referrals_id_seq OWNED BY public.referrals.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    group_id integer,
    email character varying NOT NULL,
    password_hash character varying,
    uid character varying NOT NULL,
    url_prefix character varying,
    role public.users_role_enum DEFAULT 'user'::public.users_role_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    must_change_password boolean DEFAULT true NOT NULL,
    expiration_date timestamp without time zone,
    subscription_tier character varying DEFAULT 'free'::character varying NOT NULL,
    max_cards integer DEFAULT 1 NOT NULL,
    feature_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    reset_token character varying,
    reset_token_expires timestamp without time zone,
    google_id character varying,
    facebook_id character varying,
    line_id character varying,
    referral_code character varying,
    referred_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: analytics_logs id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.analytics_logs ALTER COLUMN id SET DEFAULT nextval('public.analytics_logs_id_seq'::regclass);


--
-- Name: catalogs id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.catalogs ALTER COLUMN id SET DEFAULT nextval('public.catalogs_id_seq'::regclass);


--
-- Name: landing_pages id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.landing_pages ALTER COLUMN id SET DEFAULT nextval('public.landing_pages_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: referrals id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.referrals ALTER COLUMN id SET DEFAULT nextval('public.referrals_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: analytics_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.analytics_logs (id, user_id, visitor_id, action, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: catalogs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.catalogs (id, user_id, title, description, pdf_url, layout_config, interactive_links, custom_slug, is_active, category, video_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: landing_pages; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.landing_pages (id, user_id, title, slug, description, content_blocks, is_published, theme_config, seo_metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.leads (id, owner_id, name, email, phone, occupation, message, pdpa_consent, consent_timestamp, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.orders (id, user_id, package_name, amount, duration_days, status, slip_url, reject_reason, approved_by, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.products (id, catalog_id, name, description, price, images_json, interactive_links, "order") FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.profiles (user_id, full_name, "position", company_name, names_i18n, positions_i18n, companies_i18n, emails, phones, mobile, email_contact, line_id, website, address, profile_pic, profile_pic_url, logo, backgrounds, banners, cover_pic_url, websites, about_me, interests, layout_config, theme_color, card_design_json, social_links_json, theme_config, profile_pic_position, video_url, video_config, gallery) FROM stdin;
1	QA Super Admin	CTO	DPAT QA	[]	[]	[]	[]	[]	\N	\N	\N	\N	\N	\N	\N	\N	[]	[]	\N	[]	\N	[]	\N	\N	\N	[]	\N	{"x": 50, "y": 50, "scale": 1}	\N	\N	[]
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.referrals (id, referrer_id, referred_id, level, commission_amount, commission_rate, status, registration_fee, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, group_id, email, password_hash, uid, url_prefix, role, is_active, must_change_password, expiration_date, subscription_tier, max_cards, feature_config, reset_token, reset_token_expires, google_id, facebook_id, line_id, referral_code, referred_by, created_at) FROM stdin;
1	1	superadmin1@example.com	$2b$10$KLoX0bB8agYjzLNSmuuRaem2fEy/SbdoOkM3nVXxkLxxRrVu.Ofau	superadmin01	sup01	super_admin	t	f	\N	premium	10	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 15:17:34.772448
2	1	superadmin2@example.com	$2b$10$KLoX0bB8agYjzLNSmuuRaem2fEy/SbdoOkM3nVXxkLxxRrVu.Ofau	superadmin02	sup02	super_admin	t	f	\N	premium	10	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 15:17:41.180386
3	1	superadmin3@example.com	$2b$10$KLoX0bB8agYjzLNSmuuRaem2fEy/SbdoOkM3nVXxkLxxRrVu.Ofau	superadmin03	sup03	super_admin	t	f	\N	premium	10	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 15:17:41.181826
4	1	demo1@example.com	$2b$10$KLoX0bB8agYjzLNSmuuRaem2fEy/SbdoOkM3nVXxkLxxRrVu.Ofau	demo01	demo01	user	t	f	\N	free	1	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 15:17:48.395585
5	1	demo2@example.com	$2b$10$KLoX0bB8agYjzLNSmuuRaem2fEy/SbdoOkM3nVXxkLxxRrVu.Ofau	demo02	demo02	user	t	f	\N	free	1	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 15:17:48.396984
6	1	demo3@example.com	$2b$10$KLoX0bB8agYjzLNSmuuRaem2fEy/SbdoOkM3nVXxkLxxRrVu.Ofau	demo03	demo03	user	t	f	\N	free	1	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 15:17:48.397475
7	\N	localadmin@example.com	$2b$10$TNZyabn0ZzJh8M9ejzjXC.VlJSrELvnhZPCDfvATWpLkqEO3gCAwu	AAYHMX2nX8	f2o2x	user	t	f	\N	free	1	{"leads": false, "catalog": false, "profile": true, "namecard": false, "analytics": false, "referrals": false, "landing-pages": false}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 16:03:16.568161
8	1	rattee.akr@gmail.com	$2b$10$WwqiyR35Qbkgl4NScl3VDO39uuHAqBuHj6/T/Hnk5jntRHBnKEFZa	ratteeakr01	rat01	super_admin	t	f	\N	premium	10	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 16:10:42.980294
9	1	dpattown.ai@gmail.com	$2b$10$WwqiyR35Qbkgl4NScl3VDO39uuHAqBuHj6/T/Hnk5jntRHBnKEFZa	dpattown01	dpa01	super_admin	t	f	\N	premium	10	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 16:10:42.980294
10	1	chonlapat.th@gmail.com	$2b$10$WwqiyR35Qbkgl4NScl3VDO39uuHAqBuHj6/T/Hnk5jntRHBnKEFZa	chonlapat1	cho01	super_admin	t	f	\N	premium	10	{}	\N	\N	\N	\N	\N	\N	\N	2026-02-27 16:10:42.980294
\.


--
-- Name: analytics_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.analytics_logs_id_seq', 2, true);


--
-- Name: catalogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.catalogs_id_seq', 1, true);


--
-- Name: landing_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.landing_pages_id_seq', 1, true);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.leads_id_seq', 7, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.products_id_seq', 1, true);


--
-- Name: referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.referrals_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: catalogs PK_1883399275415ee6107413fe6c3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT "PK_1883399275415ee6107413fe6c3" PRIMARY KEY (id);


--
-- Name: orders PK_710e2d4957aa5878dfe94e4ac2f; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY (id);


--
-- Name: landing_pages PK_962a8e504985c1488c7e43c7791; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT "PK_962a8e504985c1488c7e43c7791" PRIMARY KEY (id);


--
-- Name: profiles PK_9e432b7df0d182f8d292902d1a2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT "PK_9e432b7df0d182f8d292902d1a2" PRIMARY KEY (user_id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: leads PK_cd102ed7a9a4ca7d4d8bfeba406; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY (id);


--
-- Name: analytics_logs PK_db8d22d8fe684d8a0cbd33a6df2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.analytics_logs
    ADD CONSTRAINT "PK_db8d22d8fe684d8a0cbd33a6df2" PRIMARY KEY (id);


--
-- Name: referrals PK_ea9980e34f738b6252817326c08; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT "PK_ea9980e34f738b6252817326c08" PRIMARY KEY (id);


--
-- Name: users UQ_6e20ce1edf0678a09f1963f9587; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_6e20ce1edf0678a09f1963f9587" UNIQUE (uid);


--
-- Name: landing_pages UQ_70ad771a756224c84875d2870a7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT "UQ_70ad771a756224c84875d2870a7" UNIQUE (slug);


--
-- Name: catalogs UQ_7a014b97af2c1172afa821aec03; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT "UQ_7a014b97af2c1172afa821aec03" UNIQUE (custom_slug);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: users UQ_ba10055f9ef9690e77cf6445cba; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_ba10055f9ef9690e77cf6445cba" UNIQUE (referral_code);


--
-- Name: referrals FK_18af9fcaffac6d6d3b28130e149; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT "FK_18af9fcaffac6d6d3b28130e149" FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: leads FK_4e1b2fdccce9cf66bcd9c6d2492; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "FK_4e1b2fdccce9cf66bcd9c6d2492" FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: referrals FK_507a2818bf5524662b068c2e81c; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT "FK_507a2818bf5524662b068c2e81c" FOREIGN KEY (referred_id) REFERENCES public.users(id);


--
-- Name: analytics_logs FK_850b339f8ad725294526311eef1; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.analytics_logs
    ADD CONSTRAINT "FK_850b339f8ad725294526311eef1" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: products FK_85ab225a5a310076c5ac78672bb; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_85ab225a5a310076c5ac78672bb" FOREIGN KEY (catalog_id) REFERENCES public.catalogs(id) ON DELETE CASCADE;


--
-- Name: profiles FK_9e432b7df0d182f8d292902d1a2; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: orders FK_a922b820eeef29ac1c6800e826a; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: landing_pages FK_bfa3351aefcdf30ab012045b3e2; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT "FK_bfa3351aefcdf30ab012045b3e2" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict dAKmQ09eEyeV9PAm1odcBhAFe66QfSojTObTPu6fZblzRSPaOqFRya4a85g3LzL

