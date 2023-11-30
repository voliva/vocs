import clsx from 'clsx'
import {
  type KeyboardEvent,
  type MouseEvent,
  type MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useLocation, useMatch } from 'react-router-dom'

import { type SidebarItem as SidebarItemType } from '../../config.js'
import { useSidebar } from '../hooks/useSidebar.js'
import { Icon } from './Icon.js'
import { NavLogo } from './NavLogo.js'
import { RouterLink } from './RouterLink.js'
import * as styles from './Sidebar.css.js'
import { ChevronRight } from './icons/ChevronRight.js'

export function Sidebar(props: {
  className?: string
  onClickItem?: MouseEventHandler<HTMLAnchorElement>
}) {
  const { className, onClickItem } = props

  const sidebar = useSidebar()

  if (!sidebar) return null

  const groups = getSidebarGroups(sidebar)

  return (
    <aside className={clsx(styles.root, className)}>
      <div className={styles.logoWrapper}>
        <div className={styles.logo}>
          <RouterLink to="/" style={{ alignItems: 'center', display: 'flex', height: '100%' }}>
            <NavLogo />
          </RouterLink>
        </div>
        <div className={styles.divider} />
      </div>

      <nav className={styles.navigation}>
        <div className={styles.items}>
          {groups.map((group, i) => (
            <div className={styles.group} key={i}>
              <SidebarItem depth={0} item={group} onClick={onClickItem} />
            </div>
          ))}
        </div>
      </nav>
    </aside>
  )
}

function getSidebarGroups(sidebar: SidebarItemType[]): SidebarItemType[] {
  const groups: SidebarItemType[] = []

  let lastGroupIndex = 0
  for (const item of sidebar) {
    if (item.items) {
      lastGroupIndex = groups.push(item)
      continue
    }

    if (!groups[lastGroupIndex]) groups.push({ text: '', items: [item] })
    else groups[lastGroupIndex].items!.push(item)
  }

  return groups
}

function SidebarItem(props: {
  depth: number
  item: SidebarItemType
  onClick?: MouseEventHandler<HTMLAnchorElement>
}) {
  const { depth, item, onClick } = props

  const { pathname } = useLocation()
  const match = useMatch(item.link ?? '')

  const [collapsed, setCollapsed] = useState(() => item.collapsed ?? false)
  const isCollapsable = item.collapsed !== undefined && item.items !== undefined
  const onCollapseInteraction = useCallback(
    (event: KeyboardEvent | MouseEvent) => {
      if ('key' in event && event.key !== 'Enter') return
      if (item.link) return
      setCollapsed((x) => !x)
    },
    [item.link],
  )
  const onCollapseTriggerInteraction = useCallback(
    (event: KeyboardEvent | MouseEvent) => {
      if ('key' in event && event.key !== 'Enter') return
      if (!item.link) return
      setCollapsed((x) => !x)
    },
    [item.link],
  )

  const hasActiveChildItem = useMemo(() => {
    return item.items?.some((item) => item.link === pathname) ?? false
  }, [item.items, pathname])

  if (item.items)
    return (
      <section
        className={clsx(
          styles.section,
          depth === 0 && (collapsed ? styles.levelCollapsed : styles.level),
        )}
      >
        {item.text && (
          <div
            className={styles.sectionHeader}
            {...(isCollapsable && !item.link
              ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: onCollapseInteraction,
                  onKeyDown: onCollapseInteraction,
                }
              : {})}
          >
            {item.text &&
              (item.link ? (
                <RouterLink
                  data-active={Boolean(match)}
                  onClick={onClick}
                  className={clsx(
                    depth === 0 ? styles.sectionTitle : styles.item,
                    hasActiveChildItem && styles.sectionHeaderActive,
                  )}
                  to={item.link}
                >
                  {item.text}
                </RouterLink>
              ) : (
                <div className={clsx(depth === 0 ? styles.sectionTitle : styles.item)}>
                  {item.text}
                </div>
              ))}

            {isCollapsable && (
              <div
                role="button"
                tabIndex={0}
                onClick={onCollapseTriggerInteraction}
                onKeyDown={onCollapseTriggerInteraction}
              >
                <Icon
                  className={clsx(
                    styles.sectionCollapse,
                    collapsed && styles.sectionCollapseActive,
                  )}
                  label="toggle section"
                  icon={ChevronRight}
                  size="10px"
                />
              </div>
            )}
          </div>
        )}

        <div
          className={clsx(styles.items, depth !== 0 && styles.levelInset)}
          style={collapsed ? { display: 'none' } : {}}
        >
          {item.items &&
            item.items.length > 0 &&
            depth < 5 &&
            item.items.map((item, i) => (
              <SidebarItem depth={depth + 1} item={item} key={i} onClick={onClick} />
            ))}
        </div>
      </section>
    )

  return (
    <>
      {item.link ? (
        <RouterLink
          data-active={Boolean(match)}
          onClick={onClick}
          className={styles.item}
          to={item.link}
        >
          {item.text}
        </RouterLink>
      ) : (
        <div className={styles.item}>{item.text}</div>
      )}

      <div className="indicator" />
    </>
  )
}
