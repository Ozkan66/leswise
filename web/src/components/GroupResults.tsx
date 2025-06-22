import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";

interface GroupResultsProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

interface SubmissionResult {
  user_id: string;
  worksheet_id: string;
  user_name: string;
  user_email: string;
  worksheet_title: string;
  score: number | null;
  submitted_at: string;
  status: string;
}

export default function GroupResults({ groupId, groupName, onClose }: GroupResultsProps) {
  const [results, setResults] = useState<SubmissionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('all');
  const [worksheets, setWorksheets] = useState<{ id: string; title: string }[]>([]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // First get all group members
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId)
        .eq("status", "active");

      if (membersError || !membersData) {
        setError("Failed to fetch group members");
        setLoading(false);
        return;
      }

      const userIds = membersData.map(m => m.user_id);

      if (userIds.length === 0) {
        setResults([]);
        setWorksheets([]);
        setLoading(false);
        return;
      }

      // Get submissions from group members
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select(`
          user_id,
          worksheet_id,
          score,
          created_at,
          users:user_profiles(first_name, last_name, email),
          worksheets(title)
        `)
        .in("user_id", userIds);

      if (submissionsError) {
        setError("Failed to fetch submission data");
        setLoading(false);
        return;
      }

      // Transform and flatten the data
      const formattedResults: SubmissionResult[] = (submissionsData || []).map((sub: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        user_id: sub.user_id,
        worksheet_id: sub.worksheet_id,
        user_name: sub.users[0]?.first_name && sub.users[0]?.last_name 
          ? `${sub.users[0].first_name} ${sub.users[0].last_name}`
          : sub.users[0]?.email || 'Unknown User',
        user_email: sub.users[0]?.email || '',
        worksheet_title: sub.worksheets?.title || 'Unknown Worksheet',
        score: sub.score,
        submitted_at: sub.created_at,
        status: sub.score !== null ? 'Completed' : 'Submitted'
      }));

      setResults(formattedResults);

      // Extract unique worksheets for filtering
      const uniqueWorksheets = Array.from(
        new Map(formattedResults.map(r => [r.worksheet_id, { id: r.worksheet_id, title: r.worksheet_title }]))
        .values()
      );
      setWorksheets(uniqueWorksheets);

    } catch (err) {
      setError("An error occurred while fetching results");
      console.error(err);
    }

    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const filteredResults = selectedWorksheet === 'all' 
    ? results 
    : results.filter(r => r.worksheet_id === selectedWorksheet);

  const getGroupStats = () => {
    const totalSubmissions = filteredResults.length;
    const completedSubmissions = filteredResults.filter(r => r.score !== null).length;
    const averageScore = filteredResults
      .filter(r => r.score !== null)
      .reduce((sum, r) => sum + (r.score || 0), 0) / completedSubmissions || 0;

    return {
      totalSubmissions,
      completedSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      completionRate: totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0
    };
  };

  const stats = getGroupStats();

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8 }}>
          Loading group results...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: 24, 
        borderRadius: 8, 
        width: '95%', 
        maxWidth: 900,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Results for {groupName}</h2>
          <button 
            onClick={onClose}
            style={{ 
              backgroundColor: 'transparent', 
              border: 'none', 
              fontSize: 24, 
              cursor: 'pointer',
              padding: 4
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: 16, 
            padding: 8, 
            backgroundColor: '#ffeaea', 
            borderRadius: 4 
          }}>
            {error}
          </div>
        )}

        {/* Filter and Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'auto 1fr', 
          gap: 20, 
          alignItems: 'center',
          marginBottom: 20,
          padding: 16,
          backgroundColor: '#f8f9fa',
          borderRadius: 4
        }}>
          <div>
            <label htmlFor="worksheet-filter" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Filter by Worksheet:
            </label>
            <select
              id="worksheet-filter"
              value={selectedWorksheet}
              onChange={(e) => setSelectedWorksheet(e.target.value)}
              style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4, minWidth: 200 }}
            >
              <option value="all">All Worksheets</option>
              {worksheets.map(w => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#007bff' }}>{stats.totalSubmissions}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Total Submissions</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#28a745' }}>{stats.completedSubmissions}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ffc107' }}>{stats.averageScore}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Avg Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#6f42c1' }}>{stats.completionRate}%</div>
              <div style={{ fontSize: 12, color: '#666' }}>Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {filteredResults.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>
            No submissions found for this group.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Student</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Worksheet</th>
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Score</th>
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <tr key={`${result.user_id}-${result.worksheet_id}-${index}`} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 'bold' }}>{result.user_name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{result.user_email}</div>
                    </td>
                    <td style={{ padding: 12 }}>{result.worksheet_title}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      {result.score !== null ? (
                        <span style={{ 
                          fontWeight: 'bold',
                          color: result.score >= 75 ? '#28a745' : result.score >= 50 ? '#ffc107' : '#dc3545'
                        }}>
                          {result.score}
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        backgroundColor: result.status === 'Completed' ? '#d4edda' : '#fff3cd',
                        color: result.status === 'Completed' ? '#155724' : '#856404'
                      }}>
                        {result.status}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      {new Date(result.submitted_at).toLocaleDateString()} {new Date(result.submitted_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}