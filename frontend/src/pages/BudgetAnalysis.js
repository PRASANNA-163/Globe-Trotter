import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, TrendingDown, AlertTriangle } from 'lucide-react';

const BudgetAnalysis = ({ stops, theme }) => {
  // Logic: Transform relational data into Chart-ready data
  const categoryTotals = stops.reduce((acc, stop) => {
    const cost = parseFloat(stop.cost) || 0;
    acc[0].value += cost; // In this simple version, we sum all stop costs
    return acc;
  }, [{ name: 'Accommodation & Transport', value: 0 }]);

  const COLORS = [theme.primary, theme.secondary, theme.cta, theme.accent];

  const totalSpent = categoryTotals.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ color: theme.secondary, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Wallet /> Financial Intelligence
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* PIE CHART: Spending Breakdown */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 20px 0', opacity: 0.7 }}>Expense Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryTotals} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {categoryTotals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ANALYTICS CARD: Insights */}
        <div style={{ background: theme.secondary, color: 'white', padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>TOTAL ESTIMATED COST</span>
            <h1 style={{ fontSize: '3rem', margin: '5px 0' }}>${totalSpent}</h1>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <TrendingDown color={theme.accent} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>Optimization Tip:</strong> You are spending the most in {stops[0]?.city_name || 'your first stop'}. Consider booking activities in advance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BudgetAnalysis;