--
-- PostgreSQL database dump
--

\restrict JxG8p4IzuwU0cZFartAPqtpbO16HehA1KdCSR4r2ctrnacNkTd8qcOVFqbArh7u

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.yorumlar DROP CONSTRAINT IF EXISTS yorumlar_pkey;
ALTER TABLE IF EXISTS ONLY public.seanslar DROP CONSTRAINT IF EXISTS seanslar_pkey;
ALTER TABLE IF EXISTS ONLY public.misafirler DROP CONSTRAINT IF EXISTS misafirler_pkey;
ALTER TABLE IF EXISTS ONLY public.misafirler DROP CONSTRAINT IF EXISTS misafirler_email_key;
ALTER TABLE IF EXISTS ONLY public.mesajlar DROP CONSTRAINT IF EXISTS mesajlar_pkey;
ALTER TABLE IF EXISTS ONLY public.hizmetler DROP CONSTRAINT IF EXISTS hizmetler_pkey;
ALTER TABLE IF EXISTS ONLY public.doktorlar DROP CONSTRAINT IF EXISTS doktorlar_pkey;
ALTER TABLE IF EXISTS ONLY public.doktorlar DROP CONSTRAINT IF EXISTS doktorlar_email_key;
ALTER TABLE IF EXISTS ONLY public.blog_yazilari DROP CONSTRAINT IF EXISTS blog_yazilari_pkey;
ALTER TABLE IF EXISTS ONLY public.basvurular DROP CONSTRAINT IF EXISTS basvurular_pkey;
DROP TABLE IF EXISTS public.yorumlar;
DROP TABLE IF EXISTS public.seanslar;
DROP TABLE IF EXISTS public.misafirler;
DROP TABLE IF EXISTS public.mesajlar;
DROP TABLE IF EXISTS public.hizmetler;
DROP TABLE IF EXISTS public.doktorlar;
DROP TABLE IF EXISTS public.blog_yazilari;
DROP TABLE IF EXISTS public.basvurular;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: basvurular; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.basvurular (
    id text NOT NULL,
    code_name text,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    service text NOT NULL,
    message text,
    preferred_date date,
    preferred_time text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: blog_yazilari; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_yazilari (
    id text NOT NULL,
    title text NOT NULL,
    date text,
    excerpt text,
    image text,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: doktorlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doktorlar (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'doctor'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: hizmetler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hizmetler (
    id text NOT NULL,
    title text NOT NULL,
    summary text,
    icon text,
    published boolean DEFAULT true NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: mesajlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mesajlar (
    id text NOT NULL,
    guest_id text,
    guest_name text,
    guest_email text,
    subject text NOT NULL,
    body text NOT NULL,
    status text DEFAULT 'unread'::text NOT NULL,
    reply text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone,
    replied_at timestamp with time zone,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: misafirler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.misafirler (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    provider text DEFAULT 'guest'::text,
    role text DEFAULT 'guest'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: seanslar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seanslar (
    id text NOT NULL,
    appointment_id text,
    code_name text,
    anonymous_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: yorumlar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.yorumlar (
    id text NOT NULL,
    appointment_id text,
    text text NOT NULL,
    stars integer,
    published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: basvurular basvurular_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basvurular
    ADD CONSTRAINT basvurular_pkey PRIMARY KEY (id);


--
-- Name: blog_yazilari blog_yazilari_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_yazilari
    ADD CONSTRAINT blog_yazilari_pkey PRIMARY KEY (id);


--
-- Name: doktorlar doktorlar_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doktorlar
    ADD CONSTRAINT doktorlar_email_key UNIQUE (email);


--
-- Name: doktorlar doktorlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doktorlar
    ADD CONSTRAINT doktorlar_pkey PRIMARY KEY (id);


--
-- Name: hizmetler hizmetler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hizmetler
    ADD CONSTRAINT hizmetler_pkey PRIMARY KEY (id);


--
-- Name: mesajlar mesajlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesajlar
    ADD CONSTRAINT mesajlar_pkey PRIMARY KEY (id);


--
-- Name: misafirler misafirler_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.misafirler
    ADD CONSTRAINT misafirler_email_key UNIQUE (email);


--
-- Name: misafirler misafirler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.misafirler
    ADD CONSTRAINT misafirler_pkey PRIMARY KEY (id);


--
-- Name: seanslar seanslar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seanslar
    ADD CONSTRAINT seanslar_pkey PRIMARY KEY (id);


--
-- Name: yorumlar yorumlar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yorumlar
    ADD CONSTRAINT yorumlar_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict JxG8p4IzuwU0cZFartAPqtpbO16HehA1KdCSR4r2ctrnacNkTd8qcOVFqbArh7u

