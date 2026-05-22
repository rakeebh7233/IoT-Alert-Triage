'use client';

import { useGetAlertsQuery } from '@/features/alerts/api/alertsApi';
import { Container, Typography } from '@mui/material';

export default function AlertsPage() {
    const { data, isLoading } = useGetAlertsQuery();
    console.log(data)

    return (
        <Container>
            <Typography variant="h4">Alerts</Typography>

            {isLoading && <p>Loading...</p>}
            
            {data?.map((alert: any) => (
                <div key={alert.id}>
                    {alert.title}
                </div>
            ))}
        </Container>
    );
}