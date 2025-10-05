import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user, logout, fetchUser, fetchSessions } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUser();
        const sessionData = await fetchSessions();
        setSessions(sessionData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchUser, fetchSessions]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <div className={styles.brandTitleDashboard}>DevOps Academy</div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Welcome back, {user?.fullName || user?.username}!</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Sign Out
          </button>
        </header>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Profile Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Username</span>
                <span className={styles.value}>{user?.username}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{user?.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>{user?.fullName || 'Not set'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Member Since</span>
                <span className={styles.value}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Sessions</h2>
            <div className={styles.sessionList}>
              {sessions.length === 0 ? (
                <p className={styles.emptyState}>No sessions found</p>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className={styles.sessionItem}>
                    <div className={styles.sessionInfo}>
                      <span className={styles.sessionIp}>{session.ip_address}</span>
                      <span className={styles.sessionAgent}>
                        {session.user_agent?.substring(0, 50)}...
                      </span>
                    </div>
                    <span className={styles.sessionDate}>
                      {new Date(session.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{sessions.length}</div>
            <div className={styles.statLabel}>Total Sessions</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {user?.createdAt
                ? Math.floor(
                    (Date.now() - new Date(user.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0}
            </div>
            <div className={styles.statLabel}>Days Active</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>Active</div>
            <div className={styles.statLabel}>Status</div>
          </div>
        </div>
      </div>
    </div>
  );
}
