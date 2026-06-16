import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const EvaluationChart = ({ data, currentPly, onSelectPly }) => {
  // data: [{ply, move_number, turn, evaluation}]
  
  const processedData = data.map(d => {
    // Clamp evaluation to [-10, 10] for better chart scaling
    let value = d.evaluation;
    if (value > 10) value = 10;
    if (value < -10) value = -10;
    
    return {
      ...d,
      clampedEval: value,
      displayEval: d.evaluation.toFixed(2)
    };
  });

  const handleClick = (e) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      onSelectPly(e.activePayload[0].payload.ply);
    }
  };

  return (
    <div style={{ width: '100%', height: '200px', background: 'var(--bg-card)', borderRadius: '12px', padding: '10px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData} onClick={handleClick}>
          <defs>
            <linearGradient id="colorEval" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="ply" hide />
          <YAxis domain={[-10, 10]} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--primary)' }}
            labelStyle={{ display: 'none' }}
          />
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
          {currentPly > 0 && <ReferenceLine x={currentPly} stroke="var(--secondary)" strokeWidth={2} />}
          <Area 
            type="monotone" 
            dataKey="clampedEval" 
            stroke="var(--primary)" 
            fillOpacity={1} 
            fill="url(#colorEval)" 
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvaluationChart;
