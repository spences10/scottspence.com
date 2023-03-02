import { describe, expect, test } from 'vitest'
import {
  name,
  website,
  description,
  PORTFOLIO_PROJECTS,
  POPULAR_POSTS,
  SOCIAL_LINKS,
  SITE_LINKS,
  PEOPLE,
} from './info'

describe('info', () => {
  test('name should be a string', () => {
    expect(typeof name).toBe('string')
  })

  test('website should be a string', () => {
    expect(typeof website).toBe('string')
  })

  test('description should be a string', () => {
    expect(typeof description).toBe('string')
  })

  test('PORTFOLIO_PROJECTS should be an array', () => {
    expect(Array.isArray(PORTFOLIO_PROJECTS)).toBe(true)
  })

  test('PORTFOLIO_PROJECTS should have at least one project', () => {
    expect(PORTFOLIO_PROJECTS.length).toBeGreaterThan(0)
  })

  test('each portfolio project should have a title', () => {
    PORTFOLIO_PROJECTS.forEach(project => {
      expect(project.title).toBeDefined()
      expect(typeof project.title).toBe('string')
    })
  })

  test('POPULAR_POSTS should be an array', () => {
    expect(Array.isArray(POPULAR_POSTS)).toBe(true)
  })

  test('POPULAR_POSTS should have at least one post', () => {
    expect(POPULAR_POSTS.length).toBeGreaterThan(0)
  })

  test('each popular post should have a title and path', () => {
    POPULAR_POSTS.forEach(post => {
      expect(post.title).toBeDefined()
      expect(typeof post.title).toBe('string')
      expect(post.path).toBeDefined()
      expect(typeof post.path).toBe('string')
    })
  })

  test('SOCIAL_LINKS should be an array', () => {
    expect(Array.isArray(SOCIAL_LINKS)).toBe(true)
  })

  test('SOCIAL_LINKS should have at least one link', () => {
    expect(SOCIAL_LINKS.length).toBeGreaterThan(0)
  })

  test('each social link should have a title and link', () => {
    SOCIAL_LINKS.forEach(link => {
      expect(link.title).toBeDefined()
      expect(typeof link.title).toBe('string')
      expect(link.link).toBeDefined()
      expect(typeof link.link).toBe('string')
    })
  })

  test('SITE_LINKS should be an array', () => {
    expect(Array.isArray(SITE_LINKS)).toBe(true)
  })

  test('SITE_LINKS should have at least one link', () => {
    expect(SITE_LINKS.length).toBeGreaterThan(0)
  })

  test('each site link should have a title, slug, and id', () => {
    SITE_LINKS.forEach(link => {
      expect(link.title).toBeDefined()
      expect(typeof link.title).toBe('string')
      expect(link.slug).toBeDefined()
      expect(typeof link.slug).toBe('string')
      expect(link.id).toBeDefined()
      expect(typeof link.id).toBe('string')
    })
  })

  test('PEOPLE should be an array', () => {
    expect(Array.isArray(PEOPLE)).toBe(true)
  })

  test('PEOPLE should have at least one person', () => {
    expect(PEOPLE.length).toBeGreaterThan(0)
  })

  test('each person should have a name and link', () => {
    PEOPLE.forEach(person => {
      expect(person.name).toBeDefined()
      expect(typeof person.name).toBe('string')
      expect(person.link).toBeDefined()
      expect(typeof person.link).toBe('string')
    })
  })
})
