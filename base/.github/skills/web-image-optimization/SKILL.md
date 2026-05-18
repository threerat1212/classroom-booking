## Management System Notice

This repository targets a Lawyer management system.

---
name: web-image-optimization
description: Narrow web helper for image handling in Next.js. Use after a primary root skill when you need next/image guidance, responsive image behavior, lazy loading, or image rendering cleanup.
argument-hint: "Describe the image optimization problem and page/component context"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Next.js Image Optimization

For full workflow context, see `docs/project-workflow.md`.

## When to Use This Skill

Use this skill when:

- Adding images to pages
- Optimizing image performance
- Handling responsive images
- Implementing lazy loading
- Working with external image sources

## ⚠️ CRITICAL: Always Use next/image

**Never use raw `<img>` tags. Always use `next/image` for automatic optimization.**

```tsx
// ❌ WRONG - Raw img tag
<img
  src='/hero.jpg'
  alt='Hero'
/>;

// ✅ CORRECT - next/image component
import Image from 'next/image';

<Image
  src='/hero.jpg'
  alt='Hero'
  width={1200}
  height={600}
/>;
```

## Basic Usage

### Static Images (Imported)

```tsx
import Image from 'next/image';
import heroImage from '@/public/assets/images/hero.jpg';

export default function Hero() {
  return (
    <Image
      src={heroImage}
      alt='Hero banner'
      // width and height are inferred from import
      placeholder='blur' // Auto blur placeholder
      priority // Load immediately (above fold)
    />
  );
}
```

### Static Images (Path)

```tsx
import Image from 'next/image';

export default function Logo() {
  return (
    <Image
      src='/assets/images/logo.png'
      alt='Company logo'
      width={200}
      height={50}
      // No blur placeholder for path-based images unless you provide it
    />
  );
}
```

### Remote Images

```tsx
import Image from 'next/image';

export default function ProductImage({ product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={400}
      height={400}
      // Remote images require configured domains
    />
  );
}
```

### Configure Remote Domains

```typescript
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
        port: '',
        pathname: '/products/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
```

## Responsive Images

### Fill Container

```tsx
import Image from 'next/image';

export default function Card({ image }) {
  return (
    <div className='relative h-64 w-full'>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className='rounded-lg object-cover'
      />
    </div>
  );
}
```

### Responsive with sizes

```tsx
import Image from 'next/image';

export default function ResponsiveImage() {
  return (
    <Image
      src='/hero.jpg'
      alt='Hero'
      fill
      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      className='object-cover'
    />
  );
}
```

### sizes Attribute Guide

```tsx
// Full width on all screens
sizes = '100vw';

// Full width mobile, half on tablet, third on desktop
sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

// Fixed width on large screens
sizes = '(max-width: 768px) 100vw, 800px';

// Grid layout: 1 col mobile, 2 col tablet, 3 col desktop
sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
```

## Image Patterns

### Background Image

```tsx
import Image from 'next/image';

export default function Hero() {
  return (
    <section className='relative h-screen'>
      <Image
        src='/hero-bg.jpg'
        alt=''
        fill
        priority
        className='-z-10 object-cover'
      />
      <div className='relative z-10 flex h-full items-center justify-center'>
        <h1 className='text-4xl text-white'>Welcome</h1>
      </div>
    </section>
  );
}
```

### Avatar

```tsx
import Image from 'next/image';

type AvatarProps = {
  src: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 32,
  md: 48,
  lg: 80,
};

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const dimension = sizes[size];

  return (
    <Image
      src={src}
      alt={name}
      width={dimension}
      height={dimension}
      className='rounded-full object-cover'
    />
  );
}
```

### Product Gallery

```tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

type ProductGalleryProps = {
  images: { src: string; alt: string }[];
};

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div>
      {/* Main image */}
      <div className='relative mb-4 aspect-square'>
        <Image
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          fill
          priority
          className='rounded-lg object-contain'
          sizes='(max-width: 768px) 100vw, 50vw'
        />
      </div>

      {/* Thumbnails */}
      <div className='flex gap-2'>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative h-20 w-20 rounded border-2 ${
              index === selectedIndex ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className='rounded object-cover'
              sizes='80px'
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Lazy Loading Grid

```tsx
import Image from 'next/image';

export default function ImageGrid({ images }) {
  return (
    <div className='grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1'>
      {images.map((image, index) => (
        <div
          key={image.id}
          className='relative aspect-video'
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            // First 6 images load immediately
            loading={index < 6 ? 'eager' : 'lazy'}
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='rounded-lg object-cover'
          />
        </div>
      ))}
    </div>
  );
}
```

## Placeholder Patterns

### Blur Placeholder (Imported Images)

```tsx
import Image from 'next/image';
import photo from '@/public/photo.jpg';

<Image
  src={photo}
  alt='Photo'
  placeholder='blur'
  // blurDataURL auto-generated for imports
/>;
```

### Blur Placeholder (Remote Images)

```tsx
import Image from 'next/image';

// Generate blur data URL (10x10 tiny image base64)
const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZ...';

<Image
  src='https://example.com/photo.jpg'
  alt='Photo'
  width={800}
  height={600}
  placeholder='blur'
  blurDataURL={blurDataURL}
/>;
```

### Generate Blur Placeholder

```typescript
// utils/getBlurDataURL.ts
import { getPlaiceholder } from 'plaiceholder';

export async function getBlurDataURL(src: string) {
  try {
    const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()));
    const { base64 } = await getPlaiceholder(buffer);
    return base64;
  } catch {
    return undefined;
  }
}
```

### Custom Placeholder

```tsx
import Image from 'next/image';

export function ImageWithSkeleton({ src, alt }) {
  return (
    <div className='relative'>
      <Image
        src={src}
        alt={alt}
        fill
        className='object-cover'
      />
      {/* Show skeleton until image loads */}
      <div className='absolute inset-0 -z-10 animate-pulse bg-gray-200' />
    </div>
  );
}
```

## Priority Loading

```tsx
// Use priority for above-the-fold images
<Image
  src='/hero.jpg'
  alt='Hero'
  fill
  priority // Preloads image, disables lazy loading
/>

// When to use priority:
// - Hero images
// - Largest Contentful Paint (LCP) element
// - First visible image on page
// - Logo in header
```

## Image Configuration

```typescript
// next.config.mjs
const nextConfig = {
  images: {
    // Remote patterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],

    // Custom device sizes for srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Custom image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Image formats
    formats: ['image/avif', 'image/webp'],

    // Minimum cache TTL
    minimumCacheTTL: 60,

    // Disable static import (not recommended)
    disableStaticImages: false,

    // Custom loader
    loader: 'default',

    // Unoptimized (not recommended for production)
    unoptimized: false,
  },
};
```

## SVG Handling

```tsx
// SVGs can be imported directly
import Logo from '@/public/logo.svg';

// Or use Image component with unoptimized
import Image from 'next/image';

<Image
  src='/icon.svg'
  alt='Icon'
  width={24}
  height={24}
  unoptimized // SVGs don't need optimization
/>;
```

## Checklist for Images

- [ ] **Use next/image** instead of raw `<img>`
- [ ] **Add width/height** or use `fill`
- [ ] **Use priority** for above-fold images
- [ ] **Add sizes** for responsive images with fill
- [ ] **Configure remotePatterns** for external images
- [ ] **Add placeholder** for better UX
- [ ] **Optimize alt text** for accessibility
- [ ] **Use object-fit** classes with fill

## Quick Reference

| Prop          | Purpose               | Required                   |
| ------------- | --------------------- | -------------------------- |
| `src`         | Image source          | Yes                        |
| `alt`         | Alt text              | Yes                        |
| `width`       | Width in pixels       | Yes (unless fill)          |
| `height`      | Height in pixels      | Yes (unless fill)          |
| `fill`        | Fill parent container | No                         |
| `priority`    | Preload image         | No                         |
| `loading`     | lazy/eager            | No                         |
| `placeholder` | blur/empty            | No                         |
| `sizes`       | Responsive sizes      | No (recommended with fill) |
| `quality`     | 1-100                 | No (default: 75)           |
| `unoptimized` | Skip optimization     | No                         |
