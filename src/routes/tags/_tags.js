import { basename, dirname } from 'path'

const modules = import.meta.globEager('/posts/**/*.md')

export const tagsByPost = Object.entries(modules).map(
  ([filepath, module]) => {
    const slug = basename(dirname(filepath))
    const { metadata } = module

    const { title, tags, isPrivate } = metadata
    return {
      slug,
      title,
      isPrivate,
      tags,
    }
  }
)
