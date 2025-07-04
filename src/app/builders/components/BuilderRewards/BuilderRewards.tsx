import React from 'react'

// Placeholder/mock data for demonstration
const mockRewards = {
  rif: {
    unclaimed: 999999999,
    estimated: 999999999,
    lastCycle: 999999999,
    totalEarned: 999999999,
    fiat: '999,999,999.99 USD',
  },
  rbtc: {
    unclaimed: 9999999,
    estimated: 9999999,
    lastCycle: 9999999,
    totalEarned: 9999999,
    fiat: '999,999,999.99 USD',
  },
  allTimeShare: '2%',
}

export const BuilderRewards: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`builder-rewards-container ${className}`} 
      style={{ 
        display: 'flex',
        width: '1144px',
        padding: '24px 24px 40px 24px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '40px',
        borderRadius: '4px',
        background: 'var(--Background-80, #25211E)',
      }}
    >
      {/* Builder Rewards Text */}
      <div style={{ width: '528px' }}>
        <h3 style={{ margin: 0, color: '#fff' }}>BUILDER REWARDS</h3>
      </div>

      {/* Metrics Container */}
      <div style={{ 
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        alignSelf: 'stretch',
      }}>
        {/* Unclaimed */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>Unclaimed</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
              {mockRewards.rif.unclaimed.toLocaleString()} <span role="img" aria-label="RIF">🟦</span> RIF
            </span>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{mockRewards.rif.fiat}</div>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
              {mockRewards.rbtc.unclaimed.toLocaleString()} <span role="img" aria-label="rBTC">🟧</span> rBTC
            </span>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{mockRewards.rbtc.fiat}</div>
          </div>
          <button 
            style={{ 
              marginTop: 'auto',
              padding: '8px 16px',
              border: '1px solid #fff',
              borderRadius: '4px',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onClick={() => alert('Claim Rewards (placeholder)')}
          >
            Claim Rewards
          </button>
        </div>

        {/* Estimated this cycle */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>
            Estimated this cycle <span title="Info">?</span>
          </span>
          <div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
              {mockRewards.rif.estimated.toLocaleString()} <span role="img" aria-label="RIF">🟦</span> RIF
            </span>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{mockRewards.rif.fiat}</div>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
              {mockRewards.rbtc.estimated.toLocaleString()} <span role="img" aria-label="rBTC">🟧</span> rBTC
            </span>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{mockRewards.rbtc.fiat}</div>
          </div>
        </div>

        {/* Last cycle */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>Last cycle</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
              {mockRewards.rif.lastCycle.toLocaleString()} <span role="img" aria-label="RIF">🟦</span> RIF
            </span>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{mockRewards.rif.fiat}</div>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
              {mockRewards.rbtc.lastCycle.toLocaleString()} <span role="img" aria-label="rBTC">🟧</span> rBTC
            </span>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{mockRewards.rbtc.fiat}</div>
          </div>
        </div>

        {/* Total earned */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>Total earned</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
              {mockRewards.rif.totalEarned.toLocaleString()} <span role="img" aria-label="RIF">🟦</span> RIF
            </span>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{mockRewards.rif.fiat}</div>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
              {mockRewards.rbtc.totalEarned.toLocaleString()} <span role="img" aria-label="rBTC">🟧</span> rBTC
            </span>
            <div style={{ color: '#aaa', fontSize: '12px' }}>{mockRewards.rbtc.fiat}</div>
          </div>
          <span style={{ 
            color: '#aaa', 
            fontSize: '13px', 
            marginTop: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            cursor: 'pointer',
          }}>
            <span role="img" aria-label="history">🕑</span> See Rewards history
          </span>
        </div>

        {/* All time share */}
        <div style={{ 
          display: 'flex',
          paddingBottom: '2px',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          alignSelf: 'stretch',
          flex: 1,
          minWidth: 0,
          padding: '24px',
          background: '#181818',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#aaa', fontSize: '14px' }}>
            All time share <span title="Info">?</span>
          </span>
          <span style={{ fontWeight: 700, fontSize: '32px', color: '#fff', marginTop: '16px' }}>
            {mockRewards.allTimeShare}
          </span>
        </div>
      </div>

      {/* Need to adjust backers' rewards? */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#aaa',
        fontSize: '15px',
      }}>
        <span role="img" aria-label="info">💡</span>
        Need to adjust your backers' rewards?
      </div>
    </div>
  )
}
