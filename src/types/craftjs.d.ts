import { ComponentType } from 'react'

declare module '@craftjs/core' {
  interface CraftComponent<T = any> extends ComponentType<T> {
    craft?: {
      props?: T
      related?: {
        settings?: ComponentType<any>
        toolbar?: ComponentType<any>
      }
      displayName?: string
      isCanvas?: boolean
      custom?: Record<string, any>
      rules?: {
        canDrag?: (node: any) => boolean
        canDrop?: (node: any, target: any) => boolean
        canMoveIn?: (node: any) => boolean
        canMoveOut?: (node: any) => boolean
      }
    }
  }
}

// Extend React component types to include craft property
declare global {
  namespace React {
    interface FunctionComponent<P = {}> {
      craft?: {
        props?: P
        related?: {
          settings?: ComponentType<any>
          toolbar?: ComponentType<any>
        }
        displayName?: string
        isCanvas?: boolean
        custom?: Record<string, any>
        rules?: {
          canDrag?: (node: any) => boolean
          canDrop?: (node: any, target: any) => boolean
          canMoveIn?: (node: any) => boolean
          canMoveOut?: (node: any) => boolean
        }
      }
    }
  }
}
