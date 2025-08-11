import PropTypes from 'prop-types'
import React from 'react'
import { CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCode, cilMediaPlay } from '@coreui/icons'

const DocsExample = (props) => {
  let _href = "";
  const { children, href, tabContentClassName } = props

  if (href) {
    _href = `https://coreui.io/react/docs/${href}`
  }

  return (
    <div className="example">
      {_href.length > 0 && (
        <>
          <CNav variant="underline-border">
            <CNavItem>
              <CNavLink href="#" active>
                <CIcon icon={cilMediaPlay} className="me-2" />
                Preview
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href={_href} target="_blank">
                <CIcon icon={cilCode} className="me-2" />
                Code
              </CNavLink>
            </CNavItem>
          </CNav>
        </>
      )}

      <CTabContent className={`rounded-bottom ${tabContentClassName ? tabContentClassName : ''}`}>
        <CTabPane className="p-3 preview" visible>
          {children}
        </CTabPane>
      </CTabContent>
    </div >
  )
}

DocsExample.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string,
  tabContentClassName: PropTypes.string,
}

export default React.memo(DocsExample)
