/** @jsx h */
import { h } from 'preact'
import {
  LiveEditor,
  LiveError,
  LivePreview,
  LiveProvider,
} from 'react-live'
import codeSyntaxHighlightTheme from '../../code-style.js'
import { Blockquote } from './blockquote.js'
import { DateDistance } from './date-distance.js'
import { DateUpdated } from './date-updated.js'
import { Details } from './details.js'
import { GitHubContributions } from './github-contributions.js'
import { Projects } from './projects.js'
import { Sarcasm } from './sarcasm.js'
import { Small } from './small.js'
import { Spotify } from './spotify.js'
import { TopLanguages } from './top-languages.js'
import { Tweet } from './tweet.js'
import { Vimeo } from './vimeo.js'
import { YouTube } from './youtube.js'

export const components = {
  blockquote: props => <Blockquote {...props} />,
  codeblock: props => {
    if (props[`react-live`]) {
      return (
        <div class="overflow-hidden rounded-xl mb-4 text-lg">
          <LiveProvider
            code={props.codestring}
            noInline
            theme={codeSyntaxHighlightTheme}
          >
            <LiveEditor data-name="live-editor" />
            <LiveError />
            <LivePreview data-name="live-preview" />
          </LiveProvider>
        </div>
      )
    }
    return (
      <div
        class="mb-5 p-2 bg-code-bg overflow-auto rounded-lg"
        {...props}
      />
    )
  },
  'p.inlineCode': props => (
    <code {...props} class="bg-inline-code rounded px-1" />
  ),
  // pre: props => (
  //   <div
  //     class="mb-5 p-2 bg-code-bg overflow-auto rounded-lg"
  //     {...props}
  //   />
  // ),
  Vimeo,
  Tweet,
  MarkdownParser: props => <div></div>,
  hr: props => <hr class="mb-10" />,
  Small,
  DateUpdated,
  DateDistance,
  Details,
  Sarcasm,
  Spotify,
  YouTube,
  GitHubContributions,
  Projects,
  TopLanguages,
}
