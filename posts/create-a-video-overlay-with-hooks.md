---
date: 2020-12-31
title: Create a Video Overlay with Hooks
tags: ['learning', 'guide', 'hooks', 'react']
is_private: false
---

Create a Video overlay with React hooks.

I had to create a video overlay for a project I was working on. This
example use a portal to render the player with `react-player`.

```js
// useModal.js
import { useState } from 'react'

export const useModal = () => {
  const [isShowing, setIsShowing] = useState(false)

  const toggle = () => {
    setIsShowing(!isShowing)
  }

  return {
    isShowing,
    toggle,
  }
}
```

```js
// VideoPlayer.js
import React from 'react'
import ReactPlayer from 'react-player'

export const VideoPlayer = props => {
  return (
    <ReactPlayer
      {...props}
      url="https://www.youtube.com/watch?reload=9&v=YE7VzlLtp-4"
      playing={props.playing}
      controls
      width="100%"
      height="100%"
      css={{
        position: `absolute`,
        top: 0,
        left: 0,
      }}
    />
  )
}
```

<!-- cSpell:ignore sizer,dialog -->

```js
// VideoModal.js
import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import closePrimary from '../../static/buttonClose.svg'
import { VideoPlayer } from './VideoPlayer'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: darkgrey;
  opacity: 0.5;
`

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  outline: 0;
  position: fixed;
  top: 10vh;
  bottom: 10vh;
  left: 10vh;
  right: 10vh;
  display: flex;
`

const ModalHeader = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1.5rem;
  z-index: 1;
`

const Modal = styled.div`
  background: ${({ theme }) => theme.primary};
  position: relative;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const CloseButton = styled.div`
  padding: 30px;
  border-radius: 50%;
  margin: -1rem -1rem -1rem auto;
  cursor: pointer;
  background-repeat: no-repeat;
  background-image: url(${closePrimary});
`

const PlayerWrapper = styled.div`
  position: relative;
  flex: 1;
  padding: 50px 0;
`

const PlayerSizer = styled.div`
  width: 0;
  height: 100%;
  padding-right: 82%;
  margin: 0 auto;
`

export const VideoModal = ({ isShowing, hide }) =>
  isShowing
    ? ReactDOM.createPortal(
        <>
          <ModalOverlay onClick={hide} />
          <ModalWrapper
            aria-modal
            aria-hidden
            tabIndex={-1}
            role="dialog"
          >
            <Modal>
              <ModalHeader>
                <CloseButton
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={hide}
                />
              </ModalHeader>
              <PlayerWrapper>
                <PlayerSizer>
                  <VideoPlayer playing={true} />
                </PlayerSizer>
              </PlayerWrapper>
            </Modal>
          </ModalWrapper>
        </>,
        document.body
      )
    : null
```

Then in the component:

```js
import React from 'react'
import { VideoModal } from '../components/VideoModal'
import { useModal } from '../hooks/useModal'
import styled from 'styled-components'
import playSvg from '../../static/playIcon.svg'

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const PlayDiv = styled.div`
  /* margin: 0 auto; */
  background-repeat: no-repeat;
  height: 50px;
  width: 50px;
  background-image: url(${playSvg});
`

export default () => {
  const { isShowing, toggle } = useModal()
  return (
    <>
      <Wrapper>
        <VideoModal isShowing={isShowing} hide={toggle} />
        {/* <button onClick={toggle}>Click This Button</button> */}
        <PlayDiv onClick={toggle} />
      </Wrapper>
    </>
  )
}
```
