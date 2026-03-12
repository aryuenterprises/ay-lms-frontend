import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  TextField,
  Grid,
  Box,
  Stack,
  IconButton,
  Autocomplete,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormLabel
} from "@mui/material";

import DataTable from "react-data-table-component";
import { Add as AddIcon } from "@mui/icons-material";
import { SearchNormal1 } from "iconsax-react";
import { CloseSquare, Edit, Trash } from "iconsax-react";

import MainCard from "components/MainCard";
import { useNavigate } from "react-router";

import axiosInstance from "utils/axios";
import Swal from "sweetalert2";
import { APP_PATH_BASE_URL } from "config";

import { useFormik } from "formik";
import * as Yup from "yup";
import { usePermission } from "hooks/usePermission";

/* ================= Validation ================= */

const moduleValidationSchema = Yup.object({
  test_name: Yup.string().required("Module title is required"),
  course_id: Yup.string().required("Course is required"),
  total_marks: Yup.number().required("Total marks required")
});

/* ================= Component ================= */

const AssessmentList = () => {

  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canCreate = checkPermission("Assessment", "create");
  const canUpdate = checkPermission("Assessment", "update");
  const canDelete = checkPermission("Assessment", "delete");

  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  /* ================= Formik ================= */

  const formik = useFormik({

    initialValues: {
      test_name: "",
      course_id: "",
      description: "",
      total_marks: ""
    },

    validationSchema: moduleValidationSchema,

    onSubmit: async (values, { resetForm }) => {

      try {

        const payload = {
          test_name: values.test_name,
          course_id: values.course_id,
          description: values.description,
          total_marks: parseInt(values.total_marks)
        };

        let response;

        if (editingModule) {

          response = await axiosInstance.patch(
            `${APP_PATH_BASE_URL}api/test/${editingModule.test_id}`,
            payload
          );

        } else {

          response = await axiosInstance.post(
            `${APP_PATH_BASE_URL}api/test`,
            payload
          );

        }

        if (response.data.success) {

          Swal.fire("Success", response.data.message, "success");

          fetchData();
          resetForm();
          setOpenDialog(false);
          setEditingModule(null);

        }

      } catch (error) {

        Swal.fire("Error", error.response?.data?.message || "Failed", "error");

      }

    }
  });

  /* ================= Fetch Data ================= */

  const fetchData = useCallback(async () => {

    try {

      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/test`);

      const result = response.data;

      const data = result.data?.map((item, index) => ({
        sno: index + 1,
        ...item
      }));

      setModules(data || []);
      setCourses(result.courses || []);

    } catch (err) {

      console.error(err);

    }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= Filters ================= */

  const filteredmodules = useMemo(() => {

    return modules.filter((module) => {

      const matchesSearch =
        !searchTerm ||
        module.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.course?.course_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        !selectedCourse ||
        module.course?.course_id === selectedCourse.course_id;

      return matchesSearch && matchesCourse;

    });

  }, [modules, searchTerm, selectedCourse]);

  /* ================= Delete ================= */

  const handleDeleteModule = async (moduleId) => {

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Delete this module?",
      confirmButtonColor: '#D63031',
      icon: "warning",
      showCancelButton: true
    });

    if (!result.isConfirmed) return;

    await axiosInstance.patch(`${APP_PATH_BASE_URL}api/test/${moduleId}/archive`);

    fetchData();

  };

  /* ================= Manage Questions ================= */

  const handleModuleClick = (module) => {

    navigate(`/assessment/questions/${module.test_id}`, {
      state: { module }
    });

  };

  /* ================= Edit ================= */

  const handleEditModule = (module) => {

    setEditingModule(module);

    formik.setValues({
      test_name: module.test_name,
      course_id: module.course?.course_id,
      description: module.description || "",
      total_marks: module.total_marks
    });

    setOpenDialog(true);

  };

  /* ================= Table Columns ================= */

  const columns = [

    {
      name: "S.No",
      selector: (row) => row.sno,
      width: "80px"
    },

    {
      name: "Title",
      selector: (row) => row.test_name,
      sortable: true
    },

    {
      name: "Course",
      selector: (row) => row.course?.course_name,
      sortable: true
    },

    {
      name: "Total Marks",
      selector: (row) => row.total_marks,
      center: true
    },

    {
      name: "Manage Questions",
      cell: (row) => (
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => handleModuleClick(row)}
        >
          + Add
        </Button>
      )
    },

    {
      name: "Actions",
      cell: (row) => (
        <Box>

          {canUpdate && (
            <IconButton onClick={() => handleEditModule(row)}>
              <Edit />
            </IconButton>
          )}

          {canDelete && (
            <IconButton onClick={() => handleDeleteModule(row.test_id)}>
              <Trash />
            </IconButton>
          )}

        </Box>
      )
    }

  ];

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  /* ================= UI ================= */

  return (

    <>
      <MainCard>

        <Grid container spacing={2} mb={3}>

          <Grid item xs={12} md={4}>

            <TextField
              placeholder="Search modules..."
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchNormal1 size={18} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch}>
                      <CloseSquare size={18} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

          </Grid>

          <Grid item xs={12} md={4}>

            <Autocomplete
              options={courses}
              getOptionLabel={(option) => option.course_name || ""}
              value={selectedCourse}
              onChange={(e, val) => setSelectedCourse(val)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Filter by course" size="small"/>
              )}
            />

          </Grid>

          <Grid item xs={12} md={4}>

            {canCreate && (
              <Stack alignItems="flex-end">

                <Button
                  variant="contained"
                  color='success'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    formik.resetForm();
                    setEditingModule(null);
                    setOpenDialog(true);
                  }}
                >
                  Create Module
                </Button>

              </Stack>
            )}

          </Grid>

        </Grid>

        <DataTable
          columns={columns}
          data={filteredmodules}
          pagination
          highlightOnHover
          responsive
        />

      </MainCard>

      {/* ================= Dialog ================= */}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>

        <form onSubmit={formik.handleSubmit}>

          <DialogTitle>
            {editingModule ? "Edit Module" : "Create Module"}
          </DialogTitle>

          <DialogContent>

            <Stack spacing={2} mt={1}>

              <Box>

                <FormLabel>Module Title</FormLabel>

                <TextField
                  fullWidth
                  size="small"
                  name="test_name"
                  value={formik.values.test_name}
                  onChange={formik.handleChange}
                  error={formik.touched.test_name && Boolean(formik.errors.test_name)}
                  helperText={formik.touched.test_name && formik.errors.test_name}
                />

              </Box>

              <Box>

                <FormLabel>Course</FormLabel>

                <Autocomplete
                  options={courses}
                  getOptionLabel={(option) => option.course_name || ""}
                  value={courses.find(c => c.course_id === formik.values.course_id) || null}
                  onChange={(e, val) =>
                    formik.setFieldValue("course_id", val ? val.course_id : "")
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small"/>
                  )}
                />

              </Box>

              <Box>

                <FormLabel>Total Marks</FormLabel>

                <TextField
                  name="total_marks"
                  type="number"
                  fullWidth
                  size="small"
                  value={formik.values.total_marks}
                  onChange={formik.handleChange}
                />

              </Box>

              <Box>

                <FormLabel>Description</FormLabel>

                <TextField
                  name="description"
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />

              </Box>

            </Stack>

          </DialogContent>

          <DialogActions>

            <Button sx={{backgroundColor: "#636E72",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#636E72",
                    color: "#fff",
                  }
                }} onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>

            <Button sx={{backgroundColor: "#6C5CE7",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#6C5CE7",
                    color: "#fff",
                  }
                }} type="submit" variant="contained">
              Save
            </Button>

          </DialogActions>

        </form>

      </Dialog>

    </>

  );

};

export default AssessmentList;