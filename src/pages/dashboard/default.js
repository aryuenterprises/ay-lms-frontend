// material-ui
// import { useTheme } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
// project-imports
// import EcommerceDataCard from "components/cards/statistics/EcommerceDataCard";
// import Schedule from 'sections/dashboard/Schedule';
import Attendance from "sections/dashboard/Attendance";
import CalendarTab from "sections/dashboard/CalendarTab";
import FeaturedCourses from "sections/dashboard/FeaturedCourses";
import OrgnizationAttendance from "sections/dashboard/OrgnizationAttendance";

// assets
import { Book, Teacher, User } from "iconsax-react";

import { APP_PATH_BASE_URL } from "config";
import { useCallback, useEffect, useState } from "react";
// import Cookies from 'js-cookie';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import axiosInstance from 'utils/axios';
import AnalyticSubmissions from "components/cards/statistics/AnalyticSubmissions";
import { useNavigate } from "react-router";
import { Group } from "@mui/icons-material";

import axiosInstance from "utils/axios";

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
  // console.log("dashboard")
  // const theme = useTheme();
  const navigate = useNavigate();

  const auth = JSON.parse(localStorage.getItem("auth"));
  const userType = auth?.loginType;
  // const token = Cookies.get('token');

  const [data, setData] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  // const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const webinarAnalytics = data?.webinar_analytics;
  const dailyRevenue = webinarAnalytics?.daily_revenue || [];
  const dailyRegistrations = webinarAnalytics?.daily_registrations || [];
  const monthlyRevenue = webinarAnalytics?.monthly_revenue || [];
  const monthlyRegistrations = webinarAnalytics?.monthly_registrations || [];
  const handleEnrollNow = (course) => {
    setSelectedCourse(course);
    setConfirmOpen(true);
  };
  const [viewMode, setViewMode] = useState("daily");
  const mergedDailyData = dailyRevenue.map((rev) => {
    const reg = dailyRegistrations.find(
      (r) =>
        new Date(r.day).toDateString() === new Date(rev.day).toDateString(),
    );

    return {
      day: rev.day,
      revenue: rev.total,
      registrations: reg?.total || 0,
    };
  });

  //overall revenue
  const overallRevenueData = data?.overall_monthly_revenue || [];

  const latestMonth =
    overallRevenueData.length > 0
      ? overallRevenueData[overallRevenueData.length - 1]
      : null;

  const previousMonth =
    overallRevenueData.length > 1
      ? overallRevenueData[overallRevenueData.length - 2]
      : null;

  const growth =
    previousMonth && previousMonth.total > 0
      ? (
          ((latestMonth.total - previousMonth.total) / previousMonth.total) *
          100
        ).toFixed(1)
      : null;

  const mergedMonthlyData = monthlyRevenue.map((rev) => {
    const reg = monthlyRegistrations.find(
      (r) => new Date(r.month).getMonth() === new Date(rev.month).getMonth(),
    );

    return {
      month: rev.month,
      revenue: rev.total,
      registrations: reg?.total || 0,
    };
  });
  const fetchData = useCallback(async () => {
    const response = await axiosInstance.get(
      `${APP_PATH_BASE_URL}api/dashboard`,
    );
    const data = response.data;
    setData(data?.data);
    setScheduleData(data?.schedule || []);
    setAttendanceData(data?.attendance || {});
    // setAnnouncements(data?.announcements);
    console.log("Dashboard userType:", userType);
    setFeaturedCourses(data?.featured_courses || []);

    if (userType === "employer") {
      setAttendanceData(data.data.attendance);
      // setAnnouncements(data?.data?.announcements);
      setAssignments(data.data.assignments.per_courses);
    } else if (userType === "admin" || userType === "super_admin") {
      // setAnnouncements(data?.data?.announcements);
    }
  }, [userType]);

  const submitCourseEnquiry = async () => {
    const payload = {
      ticket_type: "course_enquiry",
      course_id: selectedCourse.id,
      subject: `Enrollment enquiry for ${selectedCourse.course_name}`,
      message: `Student ${auth.user.name} requested enrollment`,
    };

    try {
      const response = await axiosInstance.post(
        `${APP_PATH_BASE_URL}api/tickets/`,
        payload,
      );

      console.log("API RESPONSE:", response.data);

      setConfirmOpen(false);
      alert("Enrollment request sent successfully");
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      alert("Failed to send enrollment request");
    }
  };

  useEffect(() => {
    fetchData();
    console.log("AUTH DATA FROM LOGIN:", auth);
    console.log("STUDENT ID FROM AUTH:", auth?.user?.student_id);
  }, [fetchData]);

  return (
    <Box
      sx={{
        mt: 0,
        p: 1,
        borderRadius: 4,
        background: "#ffffff",
        border: "1px solid #f3d6d6",
        boxShadow: "0 15px 40px rgba(193,18,31,0.08)",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* ===== Decorative Blobs ===== */}

      {/* Blob 1 */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 320,
          height: 320,
          background: "rgba(193,18,31,0.08)",
          borderRadius: "50%",
          filter: "blur(10px)",
        }}
      />

      {/* Blob 2 */}
      <Box
        sx={{
          position: "absolute",
          top: 150,
          right: -150,
          width: 300,
          height: 300,
          background: "rgba(251,113,133,0.12)",
          borderRadius: "50%",
          filter: "blur(20px)",
        }}
      />

      {/* Blob 3 */}
      <Box
        sx={{
          position: "absolute",
          bottom: -120,
          left: 200,
          width: 280,
          height: 280,
          background: "rgba(122,22,40,0.1)",
          borderRadius: "50%",
          filter: "blur(20px)",
        }}
      />

      {/* Blob 4 */}
      <Box
        sx={{
          position: "absolute",
          bottom: 100,
          right: 250,
          width: 250,
          height: 250,
          background: "rgba(244,63,94,0.08)",
          borderRadius: "50%",
          filter: "blur(10px)",
        }}
      />

      {/* Blob 5 */}
      <Box
        sx={{
          position: "absolute",
          top: 350,
          left: 50,
          width: 220,
          height: 220,
          background: "rgba(225,29,72,0.07)",
          borderRadius: "50%",
          filter: "blur(10px)",
        }}
      />

      {/* ===== Main Content Layer ===== */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Grid container rowSpacing={4.5} columnSpacing={2.75} sx={{ p: 3 }}>
          {(userType === "admin" || userType === "super_admin") && (
            <>
              {/* KPI Cards – Premium Maroon Theme */}

              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                onClick={() => navigate("/batch")}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid #f3d6d6",
                    boxShadow: "0 10px 30px rgba(193,18,31,0.08)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 40px rgba(193,18,31,0.15)",
                    },
                  }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Active Batches
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#7a1628" }}>
                        {data?.active_batches}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #c1121f, #7a1628)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                      }}>
                      <Group />
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                onClick={() => navigate("/course")}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid #f3d6d6",
                    boxShadow: "0 10px 30px rgba(193,18,31,0.08)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 40px rgba(193,18,31,0.15)",
                    },
                  }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Active Courses
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#7a1628" }}>
                        {data?.active_courses}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #fb7185, #c1121f)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                      }}>
                      <Book />
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                onClick={() => navigate("/students")}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid #f3d6d6",
                    boxShadow: "0 10px 30px rgba(193,18,31,0.08)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 40px rgba(193,18,31,0.15)",
                    },
                  }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Active Students
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#7a1628" }}>
                        {data?.active_students}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #e11d48, #7a1628)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                      }}>
                      <User />
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                onClick={() => navigate("/tutors")}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid #f3d6d6",
                    boxShadow: "0 10px 30px rgba(193,18,31,0.08)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 40px rgba(193,18,31,0.15)",
                    },
                  }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Active Tutors
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#7a1628" }}>
                        {data?.active_trainers}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #c1121f, #9b0e19)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                      }}>
                      <Teacher />
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </>
          )}

          {userType === "super_admin" && (
            <>
              {/* SECTION WRAPPER */}
              <Grid item xs={12} md={7} lg={6}>
                <Box
                  sx={{
                    mt: 3,
                    p: 4,
                    borderRadius: 4,
                    background:
                      "linear-gradient(135deg, #fff6f6 0%, #ffffff 40%, #fff1f1 100%)",
                    border: "1px solid #f3d6d6",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                  {/* Soft Decorative Background Circle */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -80,
                      right: -80,
                      width: 250,
                      height: 250,
                      background: "rgba(193,18,31,0.08)",
                      borderRadius: "50%",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 1200,
                      width: 250,
                      height: 250,
                      background: "rgba(193,18,31,0.08)",
                      borderRadius: "50%",
                    }}
                  />
                  {/* Header */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "#2f435f",
                        }}>
                        Revenue & Registration Analytics
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Performance Overview
                      </Typography>
                    </Box>

                    {/* Styled Toggle Like Screenshot */}
                    <Stack
                      direction="row"
                      sx={{
                        bgcolor: "#ffe5e5",
                        borderRadius: 3,
                        p: 0.5,
                      }}>
                      <Button
                        size="small"
                        onClick={() => setViewMode("daily")}
                        sx={{
                          px: 2.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: "none",
                          backgroundColor:
                            viewMode === "daily" ? "#bd1a25" : "transparent",
                          color: viewMode === "daily" ? "#ffffff" : "#c1121f",
                          "&:hover": {
                            backgroundColor:
                              viewMode === "daily"
                                ? "#9b0e19"
                                : "rgba(193,18,31,0.08)",
                          },
                        }}>
                        Daily
                      </Button>

                      <Button
                        size="small"
                        onClick={() => setViewMode("monthly")}
                        sx={{
                          px: 2.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: "none",
                          backgroundColor:
                            viewMode === "monthly" ? "#c1121f" : "transparent",
                          color: viewMode === "monthly" ? "#ffffff" : "#c1121f",
                          "&:hover": {
                            backgroundColor:
                              viewMode === "monthly"
                                ? "#9b0e19"
                                : "rgba(193,18,31,0.08)",
                          },
                        }}>
                        Monthly
                      </Button>
                    </Stack>
                  </Stack>

                  {/* Chart */}
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart
                      data={
                        viewMode === "daily"
                          ? mergedDailyData
                          : mergedMonthlyData
                      }>
                      <defs>
                        <linearGradient
                          id="revenueFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor="#ac9d19"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#e0d318"
                            stopOpacity={0}
                          />
                        </linearGradient>

                        <linearGradient
                          id="registrationFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor="#fbf271"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#b8ac09"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#f3d6d6"
                      />

                      <XAxis
                        dataKey={viewMode === "daily" ? "day" : "month"}
                        stroke="#9b0e19"
                        tickFormatter={(value) =>
                          viewMode === "daily"
                            ? new Date(value).getDate()
                            : new Date(value).toLocaleString("default", {
                                month: "short",
                              })
                        }
                      />

                      <YAxis stroke="#9b0e19" />

                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #f3d6d6",
                          boxShadow: "0 15px 30px rgba(193,18,31,0.1)",
                        }}
                      />

                      {/* Revenue */}
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2169a3"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#ffffff" }}
                        activeDot={{
                          r: 8,
                          stroke: "#123aaa",
                          strokeWidth: 3,
                          fill: "#ffffff",
                        }}
                        isAnimationActive
                        animationDuration={1000}
                      />

                      {/* Registrations */}
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        stroke="#fb7185"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#ffffff" }}
                        activeDot={{
                          r: 8,
                          stroke: "#fb7185",
                          strokeWidth: 3,
                          fill: "#ffffff",
                        }}
                        isAnimationActive
                        animationDuration={1300}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={5} lg={6}>
                <Box
                  sx={{
                    mt: 3,
                    p: 4,
                    borderRadius: 4,
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 20px 40px rgba(15,23,42,0.06)",
                  }}>
                  {/* Header */}
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#1f2937", mb: 3 }}>
                    Overall Academy Revenue
                  </Typography>

                  {/* Main Revenue */}
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 800, color: "#7a1628" }}>
                    ₹ {latestMonth?.total?.toLocaleString()}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
                    {latestMonth &&
                      new Date(latestMonth.month).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                  </Typography>

                  {/* Growth Indicator */}
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      backgroundColor:
                        growth > 0
                          ? "rgba(16,185,129,0.1)"
                          : "rgba(220,38,38,0.1)",
                      color: growth > 0 ? "#16a34a" : "#dc2626",
                      fontWeight: 600,
                      mb: 4,
                    }}>
                    {growth > 0 ? "▲" : "▼"} {Math.abs(growth)}% MoM
                  </Box>

                  {/* Revenue Bars */}
                  <Box>
                    {overallRevenueData.map((item, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: "#374151" }}>
                            {new Date(item.month).toLocaleString("default", {
                              month: "short",
                              year: "numeric",
                            })}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#7a1628" }}>
                            ₹ {item.total.toLocaleString()}
                          </Typography>
                        </Stack>

                        <Box
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            background: "#f3f4f6",
                            overflow: "hidden",
                          }}>
                          <Box
                            sx={{
                              height: "100%",
                              width: `${
                                (item.total /
                                  Math.max(
                                    ...overallRevenueData.map((r) => r.total),
                                  )) *
                                100
                              }%`,
                              background:
                                "linear-gradient(90deg, #7a1628, #c1121f)",
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </>
          )}

          {userType === "employer" && (
            <Grid item xs={12}>
              <Grid container spacing={3}>
                {assignments?.map((assignment) => (
                  <Grid
                    item
                    key={assignment.course_id}
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate("/report", {
                        state: { per_courses: assignments },
                      })
                    }>
                    <AnalyticSubmissions
                      title={assignment.course_name}
                      count={assignment.total_assignments}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
          {/* <Grid item xs={12} md={4} lg={3}>
        <Stack spacing={3}>
          <ProjectRelease />
          <AssignUsers />
        </Stack>
      </Grid> */}

          {/* row 3 */}
          {userType === "student" && (
            <>
              {/* <Grid item xs={12} md={6}>
            <Schedule schedule={scheduleData} />
          </Grid> */}
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <CalendarTab schedule={scheduleData} fetchData={fetchData} />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <Attendance attendance={attendanceData} />
              </Grid>
            </>
          )}
          {userType === "student" && featuredCourses?.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Popular Courses
              </Typography>

              <FeaturedCourses
                courses={featuredCourses}
                onEnroll={handleEnrollNow}
              />
            </Grid>
          )}

          {userType === "tutor" && (
            <>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <CalendarTab schedule={scheduleData} fetchData={fetchData} />
                </LocalizationProvider>
              </Grid>
            </>
          )}
          {userType === "employer" && (
            <>
              {/* <Grid item xs={12} md={6}>
            <Assignments assignments={assignments.per_student} />
          </Grid> */}
              <Grid item xs={12} md={6}>
                <OrgnizationAttendance attendance={attendanceData?.today} />
              </Grid>
            </>
          )}

          {/* {userType === 'employer' && (
        <>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarTab schedule={scheduleData} />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <Attendance attendance={attendanceData} />
          </Grid>
        </>
      )} */}
          {/* {userType === 'student' && (
        <>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarTab schedule={scheduleData} />
            </LocalizationProvider>
          </Grid>
        </>
      )} */}
          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirm Enrollment</DialogTitle>

            <DialogContent>
              <Typography>
                Are you sure you want to enroll in
                <strong> {selectedCourse?.title}</strong>?
              </Typography>

              <Typography sx={{ mt: 2 }}>
                Name: <strong>{auth?.user?.name}</strong>
                <br />
                Registration ID: <strong>{auth?.user?.registration_id}</strong>
              </Typography>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={submitCourseEnquiry}>
                Yes, Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardDefault;
