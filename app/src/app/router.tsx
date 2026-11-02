import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppShell } from './AppShell'

/**
 * 页面 ID → 路由映射（工程暂定，见交接文档第 5 节）：
 * P01 /discover        P02 /discover/people     P03 /people/:portraitId
 * P04 /discover/activities  P05 /activities/:activityId  P06 /nebula
 * P07 /square          P08 /messages            P09 /messages/:conversationId
 * P10 /me              P11 /me/portrait/edit    P12 /me/portrait/preview
 */
const DiscoveryPage = lazy(() => import('@/features/discovery/DiscoveryPage'))
const PeoplePage = lazy(() => import('@/features/discovery/PeoplePage'))
const PortraitDetailPage = lazy(() => import('@/features/portrait/PortraitDetailPage'))
const ActivitiesPage = lazy(() => import('@/features/activities/ActivitiesPage'))
const ActivityDetailPage = lazy(() => import('@/features/activities/ActivityDetailPage'))
const NebulaPage = lazy(() => import('@/features/nebula/NebulaPage'))
const SquarePage = lazy(() => import('@/features/square/SquarePage'))
const MessagesPage = lazy(() => import('@/features/messages/MessagesPage'))
const ConversationPage = lazy(() => import('@/features/messages/ConversationPage'))
const MePage = lazy(() => import('@/features/portrait/MePage'))
const PortraitEditPage = lazy(() => import('@/features/portrait/PortraitEditPage'))
const PortraitPreviewPage = lazy(() => import('@/features/portrait/PortraitPreviewPage'))

const fallback = <div className="py-16 text-center text-sm text-ink-sub">加载中…</div>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/discover" replace /> },
      { path: 'discover', element: <Suspense fallback={fallback}><DiscoveryPage /></Suspense> },
      { path: 'discover/people', element: <Suspense fallback={fallback}><PeoplePage /></Suspense> },
      { path: 'people/:portraitId', element: <Suspense fallback={fallback}><PortraitDetailPage /></Suspense> },
      { path: 'discover/activities', element: <Suspense fallback={fallback}><ActivitiesPage /></Suspense> },
      { path: 'activities/:activityId', element: <Suspense fallback={fallback}><ActivityDetailPage /></Suspense> },
      { path: 'nebula', element: <Suspense fallback={fallback}><NebulaPage /></Suspense> },
      { path: 'square', element: <Suspense fallback={fallback}><SquarePage /></Suspense> },
      { path: 'messages', element: <Suspense fallback={fallback}><MessagesPage /></Suspense> },
      { path: 'messages/:conversationId', element: <Suspense fallback={fallback}><ConversationPage /></Suspense> },
      { path: 'me', element: <Suspense fallback={fallback}><MePage /></Suspense> },
      { path: 'me/portrait/edit', element: <Suspense fallback={fallback}><PortraitEditPage /></Suspense> },
      { path: 'me/portrait/preview', element: <Suspense fallback={fallback}><PortraitPreviewPage /></Suspense> },
      { path: '*', element: <Navigate to="/discover" replace /> },
    ],
  },
])
