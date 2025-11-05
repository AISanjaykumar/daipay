# DAIPay — Production Deployment Guide

This guide explains how to build, configure, and deploy DAIPay (API + Web App) for production.

---

## 📦 Project Overview

- **API**: Express (Node.js) — `/server`
- **Web App**: React (Vite) — `/web`
- **Database**: MongoDB
- **Domains**:
  - API → `https://api.example.com`
  - Web → `https://app.example.com`

---

## 🚀 Deployment Methods

You can deploy using **Docker Compose** (recommended) or **PM2 + Nginx**.

---

## 🧰 Prerequisites

- Linux server (Ubuntu 22.04+)
- Docker & Docker Compose installed
- DNS pointing:
  - `api.example.com` → your server IP
  - `app.example.com` → your server IP
- Valid TLS certificates (Let's Encrypt or similar)

---

## 🧩 Environment Configuration

Create a file: `server/.env.prod`  
You can use `.env.prod.example` as a template (see below).

Then build and start all services:

```bash
docker compose -f docker-compose.prod.yml up -d --build
