import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

/**
 * GSAP is registered exactly once, here. Every section imports its animation
 * helpers from this module so plugins are never double-registered.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase)

ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
})

CustomEase.create('silk', 'M0,0 C0.16,1 0.3,1 1,1')
CustomEase.create('swift', 'M0,0 C0.7,0 0.28,1 1,1')
CustomEase.create('editorial', 'M0,0 C0.22,1 0.2,1 1,1')

export { gsap, ScrollTrigger, SplitText, useGSAP }
