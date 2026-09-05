import {
  Alert,
  Box,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useEffect,
  useState,
} from "react";

import { AnalyticsApi } from "../api/analyticsApi";

type AnalyticsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AnalyticsValue[]
  | { [key: string]: AnalyticsValue };

type AnalyticsRecord = Record<string, AnalyticsValue>;

interface EndpointConfig {
  title: string;
  description: string;
  endpoint: string;
  load: () => Promise<unknown>;
  chart?: "bar" | "line" | "pie";
}

interface EndpointState {
  config: EndpointConfig;
  data?: unknown;
  error?: string;
  loading: boolean;
}

const chartColors = [
  "#1976d2",
  "#2e7d32",
  "#ed6c02",
  "#7b1fa2",
  "#00838f",
  "#c62828",
];

const overviewEndpoints: EndpointConfig[] = [
  {
    title: "Executive Overview",
    description:
      "Adoption, usage, and security posture in one board-ready view.",
    endpoint: "/analytics/overview",
    load: AnalyticsApi.getOverview,
    chart: "bar",
  },
];

const authenticatorEndpoints: EndpointConfig[] = [
  {
    title: "Authenticator Mix",
    description:
      "Authenticator models and providers being used across registered passkeys.",
    endpoint: "/analytics/authenticators",
    load: AnalyticsApi.getAuthenticators,
    chart: "bar",
  },
  {
    title: "Device Types",
    description:
      "Platform and cross-platform credential distribution.",
    endpoint: "/analytics/device-types",
    load: AnalyticsApi.getDeviceTypes,
    chart: "pie",
  },
  {
    title: "Attachments",
    description:
      "Authenticator attachment patterns across the estate.",
    endpoint: "/analytics/attachments",
    load: AnalyticsApi.getAttachments,
    chart: "pie",
  },
  {
    title: "Transports",
    description:
      "USB, NFC, BLE, internal, and hybrid transport adoption.",
    endpoint: "/analytics/transports",
    load: AnalyticsApi.getTransports,
    chart: "bar",
  },
];

const securityEndpoints: EndpointConfig[] = [
  {
    title: "Policy Alignment",
    description:
      "How registered credentials align to relying-party and authenticator policy.",
    endpoint: "/analytics/policies",
    load: AnalyticsApi.getPolicies,
    chart: "bar",
  },
  {
    title: "Backup Readiness",
    description:
      "Backup eligibility and backup state across credentials.",
    endpoint: "/analytics/backup",
    load: AnalyticsApi.getBackup,
    chart: "pie",
  },
  {
    title: "Credential Age",
    description:
      "Aging view for lifecycle hygiene and rotation conversations.",
    endpoint: "/analytics/credential-age",
    load: AnalyticsApi.getCredentialAge,
    chart: "bar",
  },
];

const registrationEndpoints: EndpointConfig[] = [
  {
    title: "Daily Registrations",
    description:
      "Registration volume over time for adoption trend tracking.",
    endpoint: "/analytics/registrations/daily",
    load: AnalyticsApi.getRegistrationDaily,
    chart: "line",
  },
  {
    title: "Registration Success Rate",
    description:
      "Successful registration share and failure pressure points.",
    endpoint: "/analytics/registrations/success-rate",
    load: AnalyticsApi.getRegistrationSuccessRate,
    chart: "bar",
  },
];

const authenticationEndpoints: EndpointConfig[] = [
  {
    title: "Daily Authentications",
    description:
      "Authentication volume over time for engagement and readiness tracking.",
    endpoint: "/analytics/authentications/daily",
    load: AnalyticsApi.getAuthenticationDaily,
    chart: "line",
  },
  {
    title: "Authentication Success Rate",
    description:
      "Successful sign-in share across passkey ceremonies.",
    endpoint: "/analytics/authentications/success-rate",
    load: AnalyticsApi.getAuthenticationSuccessRate,
    chart: "bar",
  },
  {
    title: "Authentication Authenticators",
    description:
      "Authenticator usage during authentication events.",
    endpoint: "/analytics/authentications/authenticators",
    load: AnalyticsApi.getAuthenticationAuthenticators,
    chart: "bar",
  },
  {
    title: "Authentication Device Types",
    description:
      "Device type usage during authentication events.",
    endpoint: "/analytics/authentications/device-types",
    load: AnalyticsApi.getAuthenticationDeviceTypes,
    chart: "pie",
  },
  {
    title: "Authentication Users",
    description:
      "User-level authentication concentration and activity.",
    endpoint: "/analytics/authentications/users",
    load: AnalyticsApi.getAuthenticationUsers,
    chart: "bar",
  },
  {
    title: "Authentication Transports",
    description:
      "Transport usage observed during authentication.",
    endpoint: "/analytics/authentications/transports",
    load: AnalyticsApi.getAuthenticationTransports,
    chart: "bar",
  },
];

function unwrapResponse(response: unknown) {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as { data: unknown }).data;
  }

  return response;
}

function formatValue(value: AnalyticsValue): string {
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(", ")}]`;
  }

  if (value == null || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function toRecords(data: unknown): AnalyticsRecord[] {
  const payload = unwrapResponse(data);

  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is AnalyticsRecord =>
        item !== null && typeof item === "object"
    );
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nested = [
      record.data,
      record.items,
      record.results,
      record.rows,
    ].find(Array.isArray);

    if (Array.isArray(nested)) {
      return nested.filter(
        (item): item is AnalyticsRecord =>
          item !== null && typeof item === "object"
      );
    }

    const groupedEntries = Object.entries(record).filter(
      ([, value]) => Array.isArray(value)
    );

    if (groupedEntries.length) {
      return groupedEntries.flatMap(([group, value]) =>
        (value as unknown[])
          .filter(
            (item): item is AnalyticsRecord =>
              item !== null && typeof item === "object"
          )
          .map((item) => ({
            policy: group,
            ...item,
          }))
      );
    }

    const scalarEntries = Object.entries(record).filter(
      ([, value]) =>
        typeof value === "number" ||
        typeof value === "string" ||
        typeof value === "boolean"
    );

    if (scalarEntries.length) {
      return scalarEntries.map(([name, value]) => ({
        name,
        value: value as AnalyticsValue,
      }));
    }
  }

  return [];
}

function getRecordKeys(records: AnalyticsRecord[]) {
  return Array.from(
    new Set(records.flatMap((record) => Object.keys(record)))
  );
}

function pickLabelKey(keys: string[]) {
  return (
    keys.find((key) =>
      /date|day|name|type|label|user|transport|attachment|policy|age/i.test(
        key
      )
    ) ?? keys[0]
  );
}

function pickValueKey(
  records: AnalyticsRecord[],
  labelKey: string
) {
  const keys = getRecordKeys(records);

  return (
    keys.find(
      (key) =>
        key !== labelKey &&
        records.some(
          (record) => typeof record[key] === "number"
        )
    ) ?? keys.find((key) => key !== labelKey) ?? labelKey
  );
}

function toChartRows(records: AnalyticsRecord[]) {
  if (!records.length) {
    return [];
  }

  const keys = getRecordKeys(records);
  const labelKey = pickLabelKey(keys);
  const valueKey = pickValueKey(records, labelKey);

  return records.slice(0, 12).map((record) => ({
    label: formatValue(record[labelKey]),
    value:
      typeof record[valueKey] === "number"
        ? record[valueKey]
        : Number(record[valueKey]) || 0,
  }));
}

function useAnalyticsEndpoints(
  configs: EndpointConfig[]
) {
  const [states, setStates] = useState<EndpointState[]>(
    () =>
      configs.map((config) => ({
        config,
        loading: true,
      }))
  );

  useEffect(() => {
    let active = true;

    setStates(
      configs.map((config) => ({
        config,
        loading: true,
      }))
    );

    Promise.all(
      configs.map(async (config) => {
        try {
          const response = await config.load();

          return {
            config,
            data: unwrapResponse(response),
            loading: false,
          };
        } catch (error) {
          return {
            config,
            error:
              error instanceof Error
                ? error.message
                : "Unable to load analytics data.",
            loading: false,
          };
        }
      })
    ).then((nextStates) => {
      if (active) {
        setStates(nextStates);
      }
    });

    return () => {
      active = false;
    };
  }, [configs]);

  return states;
}

function AnalyticsMetricCards({
  states,
}: {
  states: EndpointState[];
}) {
  const records = states.flatMap((state) =>
    toRecords(state.data)
  );

  const metricRecords = records
    .filter((record) =>
      Object.values(record).some(
        (value) => typeof value === "number"
      )
    )
    .slice(0, 4);

  if (states.some((state) => state.loading)) {
    return (
      <Grid container spacing={2}>
        {[0, 1, 2, 3].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Skeleton variant="rounded" height={112} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const cards: AnalyticsRecord[] = metricRecords.length
    ? metricRecords
    : states.slice(0, 4).map((state) => ({
        name: state.config.title,
        value: toRecords(state.data).length,
      }));

  return (
    <Grid container spacing={2}>
      {cards.map((record, index) => {
        const keys = Object.keys(record);
        const labelKey = pickLabelKey(keys);
        const valueKey = pickValueKey([record], labelKey);

        return (
          <Grid
            key={`${formatValue(record[labelKey])}-${index}`}
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Paper sx={{ p: 2.5, height: "100%" }}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {formatValue(record[labelKey])}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {formatValue(record[valueKey])}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

function AnalyticsChart({
  chart,
  records,
}: {
  chart: EndpointConfig["chart"];
  records: AnalyticsRecord[];
}) {
  const theme = useTheme();
  const isCompact = useMediaQuery(
    theme.breakpoints.down("sm")
  );

  const chartRows = toChartRows(records);

  if (!chartRows.length) {
    return (
      <Box
        sx={{
          display: "grid",
          minHeight: 220,
          placeItems: "center",
          color: "text.secondary",
        }}
      >
        No chartable data returned yet.
      </Box>
    );
  }

  if (chart === "line") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartRows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1976d2"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chart === "pie") {
    return (
      <Box>
        <ResponsiveContainer
          width="100%"
          height={isCompact ? 220 : 300}
        >
          <PieChart>
            <Pie
              data={chartRows}
              dataKey="value"
              nameKey="label"
              outerRadius={isCompact ? 76 : 92}
              label={
                isCompact
                  ? false
                  : ({ name, value }) =>
                      `${name}: ${value}`
              }
              labelLine={!isCompact}
            >
              {chartRows.map((_, index) => (
                <Cell
                  key={index}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                value,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            mt: 1,
          }}
        >
          {chartRows.map((row, index) => (
            <Box
              key={`${row.label}-${index}`}
              sx={{
                alignItems: "center",
                display: "flex",
                gap: 1,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  bgcolor:
                    chartColors[index % chartColors.length],
                  borderRadius: "50%",
                  flex: "0 0 auto",
                  height: 10,
                  width: 10,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  overflowWrap: "anywhere",
                }}
              >
                {row.label}: {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartRows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#1976d2" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AnalyticsTable({
  records,
}: {
  records: AnalyticsRecord[];
}) {
  if (!records.length) {
    return (
      <Typography color="text.secondary" variant="body2">
        No table rows returned from this endpoint.
      </Typography>
    );
  }

  const columns = getRecordKeys(records).slice(0, 8);

  return (
    <TableContainer sx={{ mt: 2, overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {records.slice(0, 8).map((record, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column}>
                  {formatValue(record[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function EndpointPanel({
  state,
}: {
  state: EndpointState;
}) {
  const records = toRecords(state.data);

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, height: "100%" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6">
            {state.config.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {state.config.description}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={state.config.endpoint}
          variant="outlined"
        />
      </Stack>

      {state.loading && (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={260} />
          <Skeleton variant="rounded" height={120} />
        </Stack>
      )}

      {state.error && (
        <Alert severity="warning">
          {state.error}
        </Alert>
      )}

      {!state.loading && !state.error && (
        <>
          <AnalyticsChart
            chart={state.config.chart}
            records={records}
          />
          <AnalyticsTable records={records} />
        </>
      )}
    </Paper>
  );
}

function AnalyticsDashboard({
  title,
  subtitle,
  endpoints,
}: {
  title: string;
  subtitle: string;
  endpoints: EndpointConfig[];
}) {
  const states = useAnalyticsEndpoints(endpoints);

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4">
          {title}
        </Typography>
        <Typography color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>

      <AnalyticsMetricCards states={states} />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {states.map((state) => (
          <Grid
            key={state.config.endpoint}
            size={{ xs: 12, xl: endpoints.length > 1 ? 6 : 12 }}
          >
            <EndpointPanel state={state} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default function AnalyticsPage() {
  return <AnalyticsOverviewPage />;
}

export function AnalyticsOverviewPage() {
  return (
    <AnalyticsDashboard
      title="Analytics Overview"
      subtitle="Executive summary for passkey adoption, usage, and operational readiness."
      endpoints={overviewEndpoints}
    />
  );
}

export function AnalyticsAuthenticatorsPage() {
  return (
    <AnalyticsDashboard
      title="Authenticators"
      subtitle="Credential estate breakdown by authenticator, device type, attachment, and transport."
      endpoints={authenticatorEndpoints}
    />
  );
}

export function AnalyticsSecurityPage() {
  return (
    <AnalyticsDashboard
      title="Security"
      subtitle="Policy, backup, and lifecycle signals that help leaders understand risk posture."
      endpoints={securityEndpoints}
    />
  );
}

export function AnalyticsRegistrationTrendsPage() {
  return (
    <AnalyticsDashboard
      title="Registration Trends"
      subtitle="Adoption trajectory and completion health for passkey registration ceremonies."
      endpoints={registrationEndpoints}
    />
  );
}

export function AnalyticsAuthenticationTrendsPage() {
  return (
    <AnalyticsDashboard
      title="Authentication Trends"
      subtitle="Sign-in volume, success rate, user concentration, and authenticator usage."
      endpoints={authenticationEndpoints}
    />
  );
}