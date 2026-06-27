---
title: "Theme Mode Storage"
description: "System, light, and dark modes need a small persistence contract to avoid surprising the reader."
date: "2026-06-22"
tags: ["design", "typescript", "qa"]
category: "engineering"
draft: false
pinned: false
---

Theme mode is part of the reading experience. A selected mode should persist, and the system option should continue to follow operating system changes.

The control stays small, but the behavior needs to be explicit.

