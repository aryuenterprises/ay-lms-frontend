import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    Stack,
    Grid,
    IconButton,
    InputAdornment,
    Tooltip,
    Typography,
    ButtonBase,
    Paper,
    MenuItem,
    Select,
    RadioGroup,
    FormControlLabel,
    Radio,


} from '@mui/material';
// import axiosInstance from 'utils/axios';
import { APP_PATH_BASE_URL } from 'config';
import { BoxAdd, CloseSquare, Edit, Eye, SearchNormal1, Trash } from 'iconsax-react';
//import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useFormik } from 'formik';
// import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import Swal from 'sweetalert2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LinkIcon from '@mui/icons-material/Link';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
// import FeedbackIcon from '@mui/icons-material/Feedback';
import AddLinkIcon from '@mui/icons-material/AddLink';
import YouTubeIcon from '@mui/icons-material/YouTube';


// import WebinarFeedbackDialog from 'components/webinarfeedbackpop';

// import { Switch } from '@mui/material';

// Css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { usePermission } from 'hooks/usePermission';

import { useNavigate } from 'react-router';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';
import { DateTimePicker } from '@mui/x-date-pickers';
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";

// import InputLabel from 'themes/overrides/InputLabel';
// import CloseIcon from "@mui/icons-material/Close";

const WebinarList = () => {
    //  const WebinarList = () => {
    const navigate = useNavigate();
    const { checkPermission } = usePermission();
    // const handleStatusChange = () => {  };

    const canView = checkPermission('Webinar', 'view');
    const canCreate = checkPermission('Webinar', 'create');
    const canUpdate = checkPermission('Webinar', 'update');
    const canDelete = checkPermission('Webinar', 'delete');
    const [openVideoDialog, setOpenVideoDialog] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const getYoutubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : null;
    };

    console.log("getYoutubeId", getYoutubeId)

    const [title, setTitle] = useState("");
    console.log("title", title);
    const [subtitle, setSubtitle] = useState("");
    const [description, setDescription] = useState("");
    // const generateslug =(title) => title.replace(/\s+/g,"-");
    const generateSlug = (title = "") =>
        title
            .toLowerCase()
            .replace(/[^a-zA-Z\s]/g, "")
            .trim()
            .replace(/\s+/g, "-");

    //   return slug || "-";
    // }

    // console.log("generateSlug", generateSlug);

    const [slug, setSlug] = useState("")

    console.log("slug", slug);
    // setSlug(generateslug)

    const [open, setOpen] = useState(false);
    // view open details state
    const [viewOpen, setViewOpen] = useState(false);
    const [viewDetails, setViewDetails] = useState(null);
    console.log("view", viewDetails);
    const [currentWebinar, setCurrentWebinar] = useState(null);
    console.log("currentWebinar", currentWebinar);

    const [metatitle, setMetatitle] = useState("");
    const [metadesc, setMetadesc] = useState("");
    const [metaimg, setMetaimg] = useState("");
    console.log("metaImage", setMetaimg);
    const [status, setStatus] = useState("");
    console.log("status", status);

    // edit data tools
    const [editTools, setEditTools] = useState([]);
    // edit add data tool
    //  const [newEditToolsData,setNewEditToolsData]=useState([]);
    const [editToolsOpen, setEditToolsOpen] = useState(false)

    console.log("metatitle", metatitle);
    console.log("metadesc", metadesc);
    console.log("metaimg", metaimg);
    const [webinarimage, setWebinarimage] = useState("");
    console.log("webinarimage", webinarimage)
    // const[webinarstart,setWebinarstart]=useState("");


    const [Webinar, setWebinar] = useState([]);

    const [language, setLanguage] = useState("");
    console.log("language", language);
    const [mode, setMode] = useState("");

    console.log("modetype", mode);




    const [imagePreview, setImagePreview] = useState(null);
    //   console.log("imagePreview",imagePreview);

    const [imagePreviewweb, setImagePreviewweb] = useState(null);


    // const [ImageFile, setImageFile] = useState(null);

    const [error, setError] = useState('');
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [loading, setLoading] = useState(false);
    // const[meta,Setmeta]=useState([
    //     {
    //         metatitle:"",metadescription:"",metaimage:null
    //     }
    // ])
    console.log(error)
    const [items, setItems] = useState([
        { title: "", file: null, preview: null },
    ]);
    console.log("items", items);
    const [faqs, setFaqs] = useState([
        { question: "", answer: "", preview: null },
    ])
    console.log("faq", faqs);
    const CopyFBLink = ({ row }) => {
        const [copied, setCopied] = React.useState(false);

        const webinarUuid =
            row.webinar_uuid ||
            row.webinar?.uuid ||
            row.uuid;

        const feedbackLink = webinarUuid
            ? `${window.location.origin}/feedback/${webinarUuid}`
            : '';

        const handleCopy = (e) => {
            e.stopPropagation();
            if (!feedbackLink) return;

            navigator.clipboard.writeText(feedbackLink).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            });
        };

        return (
            <Tooltip title={copied ? 'Copied!' : 'Click to copy'}>
                <IconButton color="primary" onClick={handleCopy}>
                    <AddLinkIcon />
                </IconButton>
            </Tooltip>
        );
    };


    const handleAdd = () => {
        setItems([...items, { title: "", file: null, preview: null }]);
    };

    //    const handleEditAdd = () => {
    //     console.log("enter tools",editTools);
    //     setEditTools((pre)=>[...pre, { title: "", file: null, preview: null,isFileModify:true,istextModify:true,isDeleted:false}]);
    // };

    const handleEditAdd = () => {
        setEditTools((pre) => [
            ...pre,
            {
                id: uuidv4,
                title: "",
                file: null,
                preview: null,
                isFileModify: true,
                istextModify: true,
                isDelete: false
            }
        ]);
    };

    console.log("edit tools", editTools);
    const handleFaqadd = () => {
        setFaqs([...faqs, { question: "", answer: "", preview: null }])
    }
    const handleFaqremove = (index) => {

        const updated = [...faqs];
        updated.splice(index, 1);
        setFaqs(updated);
    }
    const handleRemove = (index) => {
        const updated = [...items];
        updated.splice(index, 1);
        setItems(updated);
    };

    const handleTitleChange = (index, value) => {
        const updated = [...items];
        updated[index].title = value;
        setItems(updated);
    };

    const handleFileChange = (index, file) => {
        const updated = [...items];
        updated[index].file = file;
        updated[index].preview = URL.createObjectURL(file);
        setItems(updated);
    };

    // edit
    //  const handleEditRemove = (index) => {
    //     const updated = [...items];
    //     updated.splice(index, 1);
    //     // updated[index].isDelete=true;
    //     setEditTools(updated);
    // };

    // const handleEditTitleChange = (index, value) => {
    //     const updated = [...items];
    //     updated[index].title = value;
    //     updated[index].istextModify=true
    //     setEditTools(updated);
    // };
    const handleEditTitleChange = (index, value) => {
        setEditTools(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                title: value,
                istextModify: true
            };
            return updated;
        });
    };

    //  const handleEditFileChange = (index, file) => {
    //     // const updated = [...items];
    //     // updated[index].file = file;
    //     // updated[index].isFileModify=true
    //     // updated[index].preview = URL.createObjectURL(file);
    //     // setEditTools(updated);
    //     setEditTools((pre)=>[...pre,{}])

    // };
    const handleEditFileChange = (index, file) => {
        setEditTools(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                file: file,
                preview: URL.createObjectURL(file),
                isFileModify: true
            };
            return updated;
        });
    };
    const handleEditRemove = (index) => {
        setEditTools(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                isDelete: true
            };
            return updated;
        });

    }

    const handleQuestionChange = (index, value) => {
        const updated = [...faqs];
        updated[index].question = value;
        setFaqs(updated);
    }
    const handleAnswerChange = (index, value) => {
        const updated = [...faqs];
        updated[index].answer = value;
        setFaqs(updated);
    }

    // const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    // const userId = auth?.user?.user_id;
    // const dummyWebinars = [
    //     {
    //         id: 1,
    //         title: 'React Basics Webinar',
    //         description: 'Introduction to React fundamentals',
    //         start_at: '2026-02-10',
    //         time: '10:30:00',
    //         max_participants: 100,
    //         status: true,
    //         started: false,
    //         link: 'https://meet.google.com/react-basics',
    //         price: 0,
    //         webinarType: 'Free'
    //     },
    //     {
    //         id: 2,
    //         title: 'Advanced Django REST',
    //         description: 'Deep dive into Django REST Framework',
    //         start_at: '2026-02-15',
    //         time: '14:00:00',
    //         max_participants: 75,
    //         status: true,
    //         started: true,
    //         link: 'https://zoom.us/j/987654321',
    //         price: 499,
    //         webinarType: 'Paid'
    //     },
    //     {
    //         id: 3,
    //         title: 'AI & Machine Learning',
    //         description: 'AI concepts with real-world examples',
    //         start_at: '2026-02-20',
    //         time: '18:00:00',
    //         max_participants: 150,
    //         status: false,
    //         started: false,
    //         link: 'https://teams.microsoft.com/ai-webinar',
    //         price: 999,
    //         webinarType: 'Paid'
    //     },
    //     {
    //         id: 4,
    //         title: 'Frontend Performance Optimization',
    //         description: 'Improve React app performance',
    //         start_at: '2026-02-25',
    //         time: '11:00:00',
    //         max_participants: 120,
    //         status: true,
    //         started: false,
    //         link: 'https://meet.google.com/frontend-perf',
    //         price: 0,
    //         webinarType: 'Free'
    //     }
    // ];

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`api/webinar/web`);
            const result = response?.data || [];
            console.log('Fetched webinars:', result);
            setWebinar(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpen = () => {
        setCurrentWebinar(null);
        formik.setFieldValue("mentor", "");
        formik.setFieldValue("tools", [{ title: "" }]);
        // formik.setFieldValue("image")
        setOpen(true);
    };
    // open view model
    const handleViewOpen = (value) => {
        setViewDetails(value);
        setViewOpen(true);
    };
    // handle view close
    const handleViewClose = () => {
        setViewOpen(false);
    };

    console.log("viewDetails", viewDetails)
    const filteredItems = useMemo(() => {
        if (!Webinar || !Array.isArray(Webinar)) return [];

        if (filterText) {
            return Webinar?.filter(
                (item) =>
                    item.title.toLowerCase().includes(filterText.toLowerCase()) || item.description.toLowerCase().includes(filterText.toLowerCase())
            );
        }
        return Webinar ? Webinar : [];
    }, [Webinar, filterText]);
    // console.log("filteredItems",filteredItems);

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };

        return (
            <Grid container justifyContent="space-between" alignItems="center" my={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        placeholder="Search by webinar name or description..."
                        variant="outlined"
                        size="small"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchNormal1 size={20} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {filterText && (
                                        <IconButton onClick={handleClear} edge="end" size="small">
                                            <CloseSquare size={20} />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6} textAlign="right">

                    <Button color="success" variant="contained" startIcon={<BoxAdd />} onClick={handleOpen}>
                        Add Webinar
                    </Button>

                </Grid>
            </Grid>
        );
    }, [filterText, resetPaginationToggle, canCreate]);

    const handleEdit = (webinar) => {
        console.log("alledit", webinar);
        setEditToolsOpen(true);
        // try{
        //     const response = await.axiosInstance.get(`webinar/${webinarUuid}`)
        // }

        setCurrentWebinar({
            link: webinar.zoom_link,
            webinarName: webinar.title,
            webinarSubtitle: webinar.Subtitle,
            webinarDescription: webinar.description,
            webinarDateTime: webinar.scheduled_start,
            id: webinar.uuid,
            // metatitle: webinar.metatitle,
            // metaimage:webinar.meta_image,
            // metadescription: webinar.metadescription,
            webinarType: webinar.is_paid ? 'Paid' : 'Free',
            regular_price: webinar.regular_price,
            price: webinar.price,
            state: webinar.state,
            city: webinar.city,
            profession: webinar.profession,
            logs: webinar.logs,
            mentor: webinar?.mentor,


            // mode:webinar?.mode,
            video_url: webinar?.video_url,
        });
        console.log("test meta title", webinar?.metadata[0]?.meta_title)
        const updatingItemformat = webinar?.tools.map((value) => {
            return ({
                title: value?.tools_title, file: value?.tools_image, preview: value?.image_url, id: value?.id, istextModify: false, isFileModify: false, isDelete: value?.is_deleted, oldData: true


            })
        })
        setEditTools(updatingItemformat);

        setTitle(webinar.title);
        setSlug(webinar?.slug);
        setDescription(webinar?.description);
        setSubtitle(webinar?.sub_title || "-");
        // setMetatitle(webinar?.metatitle);
        // setMetaimg(webinar?.metaimage);
        // setMetadesc(webinar?.metadescription);
        setVideoUrl(webinar?.video_url);
        setWebinarimage(webinar?.webinar_image);
        setMode(webinar?.mode);
        setImagePreviewweb(webinar?.webinar_image_url);
        setMetatitle(webinar?.metadata[0]?.meta_title);
        setMetadesc(webinar?.metadata[0]?.meta_description);
        setMetaimg(webinar?.metadata[0]?.image_url);
        setImagePreview(webinar?.metadata[0]?.image_url);
        setFaqs(webinar?.faqs);
        setStatus(webinar?.webinar_status);


        // setItems(updatingItemformat);
        setLanguage(webinar?.language);


        setOpen(true);
    };
    // const handleView{


    // }

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`api/webinar/web/${id}/`);
                if (response.data.status === true) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'webinar has been deleted.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    fetchData();
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: response?.data?.message || 'Error deleting webinar.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }


            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'Failed to delete webinar.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setItems([]);
        setEditTools([]);
        formik.resetForm();
    };

    const handleStatusChange = async (row, newStatus) => {
        try {
            // const actionText = newStatus === "ACTIVE" ? "Activate" : "Inactivate";

            // const result = await Swal.fire({
            //     title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Webinar`,
            //     text: `Are you sure you want to ${actionText} this webinar?`,
            //     icon: "warning",
            //     showCancelButton: true,
            //     confirmButtonText: "Yes",
            //     cancelButtonText: "No",
            // });

            // if (!result.isConfirmed) return;

            setLoading(true);

            await axiosInstance.patch(
                `${APP_PATH_BASE_URL}api/live-webinar/${row.webinar_link}`,
                { webinar_status: newStatus }
            );

            // ✅ Correct state update
            setWebinar((prev) =>
                prev.map((w) =>
                    w.webinar_link === row.webinar_link
                        ? { ...w, webinar_status: newStatus }
                        : w
                )
            );
        } catch (error) {
            console.error("Failed to change webinar status", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewChange = useCallback(
        (webinar) => {
            console.log("usecall",)
            if (webinar) {
                console.log(webinar?.uuid, "webinar registration", webinar);

                navigate(`/webinar/${webinar.uuid}/`, {
                    state: {
                        webinarData: {
                            ...webinar
                        }
                    }
                });
            }
        },
        [navigate]
    );
    const handleWebinarstart = useCallback(
        async (webinar) => {
            try {
                // 👉 No PATCH here (backend handles LIVE status)

                // 1️⃣ Navigate to session start
                await axiosInstance.post(
                    `/api/webinar/${webinar.uuid}/session/start/`
                );

                // 2️⃣ Optional: refresh list AFTER returning from session
                fetchData();
            } catch (error) {
                console.error('Failed to start webinar', error);
            }
        },
        [fetchData]
    );



    const handleWebinarend = useCallback(
        async (webinar) => {
            try {
                // 1️⃣ Call session end API (backend marks FINISHED)
                await axiosInstance.post(
                    `/api/webinar/${webinar.uuid}/session/end/`
                );

                // 2️⃣ Call attendance sync API
                await axiosInstance.post(
                    `/api/webinar/${webinar.uuid}/attendance/sync/`
                );

                // 3️⃣ Refresh list
                fetchData();
            } catch (error) {
                console.error('Failed to sync attendance or end webinar', error);
            }
        },
        [fetchData]
    );




    //  const validationSchema = Yup.object({
    //   price: Yup.number()
    //     .typeError('Price must be a number')
    //     .positive('Price must be greater than 0')
    // //     .required('Price is required')
    // });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            // webinarName: currentWebinar?.webinarName || '',
            // webinarsubtitle: currentWebinar?.webinarSubtitle || '',
            // webinarDescription: currentWebinar?.webinarDescription || '',
            webinarDateTime: currentWebinar?.webinarDateTime ? new Date(currentWebinar.webinarDateTime) : null,
            video_url: currentWebinar?.video_url,
            regular_price: currentWebinar?.regular_price,
            price: currentWebinar?.price,
            webinarType: currentWebinar?.webinarType || 'Free',
            metadata: [{


                metaTitle: currentWebinar?.metatitle || '',
                metaDescription: currentWebinar?.metadescription || '',
                metaImage: currentWebinar?.metaImage || null,

            }],



            mentor: currentWebinar?.mentor,
            // language: currentWebinar?.language || '',
            // slug: currentWebinar?.slug || '',
            // tools: [
            //     {
            //         toolTitle: currentWebinar?.toolTitle || '',
            //         toolImage: currentWebinar?.toolImage || ''
            //     }
            // ]
        },


        // validationSchema: Yup.object().shape({
        //     // webinarName: Yup.string()
        //     //     .required('Webinar title is required')
        //     //     .matches(/^[A-Za-z0-9\s\-_,.!?;:'"()]+$/, 'Webinar title can only contain letters, numbers, spaces and basic punctuation')
        //     //     .trim(),
        //     webinarSubtitle: Yup.string()
        //         .required('Webinar subtitle is required')
        //         .matches(/^[A-Za-z0-9\s\-_,.!?;:'"()]+$/, 'Webinar subtitle can only contain letters, numbers, spaces and basic punctuation')
        //         .trim(),
        //     webinarDescription: Yup.string().required('Webinar description is required').trim(),
        //     webinarDateTime: Yup.date().required('Webinar date is required').min(new Date(), 'Webinar date must be in the future').nullable(),

        //     regularprice: Yup.number().when('webinarType', {
        //         is: 'Paid',
        //         then: (schema) => schema.required('Price is required for paid webinars').min(0, 'Price must be positive'),
        //         otherwise: (schema) => schema.notRequired().nullable()
        //     }),
        //     salePrice: Yup.number()
        //         .nullable()
        //         .transform((value, originalValue) =>
        //             originalValue === '' ? null : value
        //         )
        //         .min(0, 'Sale price cannot be negative')
        //         .when('regularPrice', (regularPrice, schema) =>
        //             regularPrice
        //                 ? schema.max(
        //                     regularPrice,
        //                     'Sale price must be less than regular price'
        //                 )
        //                 : schema
        //         ),
        //     webinarType: Yup.string().oneOf(['Free', 'Paid']).required('Webinar type is required')


        // }),
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                const payload = new FormData();
                // handle date format
                const date = values.webinarDateTime;

                const appendIfExists = (key, value) => {
                    if (
                        value !== undefined &&
                        value !== null &&
                        value !== '' &&
                        !(value instanceof File && value.size === 0)
                    ) {
                        payload.append(key, value);
                    }
                };

                const pad = (n) => String(n).padStart(2, '0');

                const formatted =
                    date.getFullYear() + '-' +
                    pad(date.getMonth() + 1) + '-' +
                    pad(date.getDate()) + 'T' +
                    pad(date.getHours()) + ':' +
                    pad(date.getMinutes()) + ':' +
                    pad(date.getSeconds()) +
                    '+05:30';
                console.log("test 123", subtitle, description);
                // normal fields
                // Before check value is empty
                appendIfExists('title', title?.trim());
                appendIfExists('sub_title', subtitle?.trim());
                appendIfExists('description', description?.trim());
                appendIfExists('scheduled_start', formatted);
                appendIfExists('language', language);
                appendIfExists('slug', slug);
                appendIfExists('webinar_status', status);

                // payload.append('title', title.trim());
                // payload.append('Subtitle', subtitle.trim());
                // payload.append('description', description.trim());
                // .format('YYYY-MM-DDTHH:mm:ssZ')
                // payload.append('scheduled_start', formatted);
                payload.append('video_url', videoUrl);

                if (values?.webinarType === "Paid") {
                    payload.append('regular_price', Number(values.regular_price));
                    payload.append('price', Number(values.price));
                }


                payload.append('is_paid', values?.webinarType === 'Paid');
                payload.append('mentor', values?.mentor?.trim());
                payload.append('mode', mode);
                // payload.append('language', language);
                // payload.append('slug', slug);



                // webinar image
                // if (webinarimage) {
                //     payload.append('webinar_image', webinarimage);
                // }
                const isFile = (val) =>
                    val instanceof File || val instanceof Blob;

                if (isFile(webinarimage)) {
                    payload.append('webinar_image', webinarimage);
                }

                if (isFile(metaimg)) {
                    payload.append(`metadata[0][meta_image]`, metaimg);
                }



                payload.append(
                    `metadata[${0}][meta_title]`,
                    metatitle
                );

                payload.append(
                    `metadata[${0}][meta_description]`,
                    metadesc
                );

                // if (metaimg) {
                //     payload.append(
                //         `metadata[${0}][meta_image]`,
                //         metaimg
                //     );
                // }
                let deleteIndex = 0;


                {
                    !editToolsOpen ?
                        (items.forEach((tool, index) => {

                            payload.append(
                                `tools[${index}][tools_title]`,
                                tool.title
                            );

                            payload.append(
                                `tools[${index}][tools_image]`,
                                tool.file
                            );
                        })
                        )
                        :
                        (editTools.map((value) => {
                            console.log("vvvv", value);
                            if (value.isDelete) {

                                if (value.oldData) {
                                    payload.append(
                                        `tools[${deleteIndex}][id]`,
                                        value.id
                                    );
                                    payload.append(
                                        `tools[${deleteIndex}][is_deleted]`,
                                        true
                                    );
                                    deleteIndex++;
                                }


                            }
                            else {

                                if (value?.oldData) {
                                    if (value.isDelete) {
                                        payload.append(
                                            `tools[${deleteIndex}][id]`,
                                            value.id
                                        );
                                        payload.append(
                                            `tools[${deleteIndex}][is_deleted]`,
                                            true
                                        );
                                        deleteIndex++;

                                    }
                                    else {
                                        if (value.istextModify) {
                                            payload.append(
                                                `tools[${deleteIndex}][id]`,
                                                value.id
                                            );
                                            payload.append(
                                                `tools[${deleteIndex}][tools_title]`,
                                                value.title
                                            );
                                            deleteIndex++;

                                        }

                                        if (value.isFileModify) {
                                            payload.append(
                                                `tools[${deleteIndex}][id]`,
                                                value.id
                                            );
                                            payload.append(
                                                `tools[${deleteIndex}][tools_image]`,
                                                value.file
                                            );
                                            deleteIndex++;

                                        }
                                    }

                                }
                                else {
                                    payload.append(
                                        `tools[${deleteIndex}][tools_title]`,
                                        value.title
                                    );

                                    payload.append(
                                        `tools[${deleteIndex}][tools_image]`,
                                        value.file
                                    );
                                    deleteIndex++;

                                }



                            }



                        }))

                }
                // faqs.forEach((faqs, index) => {
                //     payload.append(`faqs[${index}][question]`, faqs.question);
                //     payload.append(`faqs[${index}][answer]`, faqs.answer);
                // });

                payload.append('faqs', JSON.stringify(faqs))




                console.log('Payload to submit:', payload);


                const method = currentWebinar ? 'PATCH' : 'POST';
                const url = currentWebinar ? `api/webinar/web/${currentWebinar.id}/` : `api/webinar/web`;

                const response = await axiosInstance({
                    method: method,
                    url: url,
                    data: payload
                });

                const result = response.data;

                if (result.status === true) {
                    Swal.fire({
                        title: 'Success!',
                        text: currentWebinar ? 'Webinar updated successfully!' : 'Webinar added successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    // normal state empty
                    setTitle("");
                    setSlug("");
                    setDescription("");
                    setSubtitle("");
                    setMetatitle("");
                    setMetaimg(null);
                    setMetadesc("");
                    setVideoUrl(null);
                    setWebinarimage("");
                    setImagePreviewweb(null);
                    setMetatitle("");
                    setMetadesc("");
                    setImagePreview(null);
                    setFaqs([]);
                    setItems([]);
                    setLanguage("");
                    setStatus("");
                    setMode(null);


                    // usefomik reset
                    resetForm();
                    fetchData();
                    handleClose();



                } else {
                    const errorMessage = result.message;
                    Swal.fire({
                        title: 'Error!',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } finally {
                setSubmitting(false);
            }
        }
    });
    console.log(formik.errors);
    console.log("editTools last", editTools);

    const handleWebinarChange = async (action, currentWebinar) => {
        try {
            // Show confirmation dialog and wait for user response
            const confirmation = await Swal.fire({
                title: 'Confirm',
                text: `Are you sure you want to ${action} this webinar?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, ' + action + ' it!',
                cancelButtonText: 'Cancel'
            });

            // If user cancels, exit the function
            if (!confirmation.isConfirmed) {
                return;
            }

            // Make API call only after user confirms
            const response = await axiosInstance.patch(`api/webinar/web/${currentWebinar.uuid}/`, { status: action });

            const result = response.data;

            if (result.status === true) {
                await Swal.fire({
                    title: 'Success!',
                    text: `Webinar ${action}ed successfully!`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                // Refresh data
                fetchData();
            } else {
                const errorMessage = result.message;
                await Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const columns = [
        {
            name: 'S.No',
            cell: (_row, index) => index + 1,
            sortable: true,
            width: '80px'
        },
        {
            name: 'Webinar Name',
            selector: (row) => row.title,
            sortable: true,
            wrap: true
        },
        {
            name: 'Date & Time',
            cell: (row) => (
                <div style={{ whiteSpace: 'normal', lineHeight: '1.4' }}>
                    {formatDateTime(row.scheduled_start)}
                </div>
            ),
            sortable: true,
            wrap: true
        },
        {
            name: 'Reg Count',
            cell: (row) => (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Tooltip title="View Participants">
                        <Button
                            variant="text"
                            onClick={(e) => {
                                e.stopPropagation(); // prevent row click if any
                                handleViewChange(row); // navigate or show details
                            }}
                            sx={{
                                minWidth: 0,
                                padding: 0,
                                color: '#1976d2',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {row.participants_count}
                        </Button>
                    </Tooltip>
                </Box>
            ),
            sortable: true,
            center: true,
            wrap: true
        }
        ,
        {
            name: 'Reg Link',
            cell: () => (
                <Tooltip title="Open registration link">
                    <a
                        href="https://workshop.aryuacademy.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                        <LinkIcon color="primary" />
                    </a>
                </Tooltip>
            ),
            center: true
        },

        {
            name: 'Scheduled',
            cell: (row) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {row.is_completed === true ? (
                        <Button variant="contained" color="success" size="small">
                            Completed
                        </Button>
                    ) : row.status === 'DRAFT' ? (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleWebinarChange('SHEDULED', row)}
                        >
                            No
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleWebinarChange('DRAFT', row)}
                        >
                            Yes
                        </Button>
                    )}
                </Box>
            ),
            sortable: true
        },
        {
            name: 'Status',
            cell: (row) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {row.webinar_status === true ? (
                        <Button variant="outlined" color="success" size="small">
                            Active
                        </Button>
                    ) : row.webinar_status === 'DRAFT' ? (
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleStatusChange('SHEDULED', row)}
                        >
                            No
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleStatusChange('DRAFT', row)}
                        >
                            Inactivate
                        </Button>
                    )}
                </Box>
            ),
            sortable: true

        },
        {
            name: 'Start',
            cell: (row) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {row.status === 'COMPLETED' ? (
                        <Button variant="contained" color="success" size="small">
                            Finished
                        </Button>
                    ) : row.status === 'LIVE' ? (
                        <Button
                            variant="contained"
                            color="error"
                            // sx={{bgcolor:'blue'}}
                            size="small"
                            onClick={() => handleWebinarend(row)}
                        >
                            Live
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleWebinarstart(row)}
                        >
                            Go Live
                        </Button>
                    )}
                </Box>
            ),
            sortable: true
        },
        // {
        //     name: 'Feedback',
        //     cell: (row) => (
        //         <Tooltip title="Webinar Feedback">
        //             <IconButton
        //                 color="primary"
        //                 onClick={(e) => {
        //                     e.stopPropagation();
        //                     setSelectedWebinarUuid(row.uuid); // ✅ now row exists
        //                     setFeedbackOpen(true);
        //                 }}
        //             >
        //                 <FeedbackIcon />
        //             </IconButton>
        //         </Tooltip>
        //     ),
        //     center: true
        // },
        // {
        //     name: 'FB Link',
        //     cell: (row) => (
        //         <Tooltip title="Click to copy">
        //             <IconButton
        //                 color="primary"
        //                 onClick={(e) => {
        //                     e.stopPropagation();

        //                     const webinarUuid =
        //                         row.webinar_uuid ||
        //                         row.webinar?.uuid ||
        //                         row.uuid;

        //                     if (!webinarUuid) {
        //                         alert('Webinar ID not found');
        //                         console.error('Invalid row data:', row);
        //                         return;
        //                     }

        //                     const feedbackLink = `${window.location.origin}/feedback/${webinarUuid}`;

        //                     navigator.clipboard.writeText(feedbackLink)
        //                         .then(() => {
        //                             console.log('Link copied:', feedbackLink);
        //                         })
        //                         .catch((err) => {
        //                             console.error('Failed to copy:', err);
        //                         });
        //                 }}
        //             >

        //                 <AddLinkIcon />
        //             </IconButton>
        //         </Tooltip>
        //     )
        // },
        {
            name: 'FB Link',
            cell: (row) => <CopyFBLink row={row} />
        },




        {
            name: 'Zoom Link',
            cell: (row) => (
                <Tooltip title="Join Zoom">
                    <IconButton
                        color="primary"
                        onClick={() => window.open(row?.zoom_link, '_blank', 'noopener,noreferrer')}
                        disabled={!row?.zoom_link}
                    >
                        <InsertLinkOutlinedIcon />
                    </IconButton>
                </Tooltip>
            ),
            center: true
        },





        ...(canUpdate || canDelete || canView
            ? [
                {
                    name: 'Actions',
                    cell: (row) => (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {/* <Tooltip title="View Details">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewChange(row);
                                    }}
                                >
                                    <Eye />
                                </IconButton>
                            </Tooltip> */}
                            <Tooltip title="View Details">


                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewOpen(row);
                                    }}
                                >
                                    <Eye />
                                </IconButton>
                            </Tooltip>

                            {/* <Tooltip title="Tap to copy link">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(row.zoom_link);
                                    }}
                                >
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Tooltip> */}

                            {canUpdate && (
                                <Tooltip title="Edit">
                                    <IconButton color="info" onClick={() => handleEdit(row)}>
                                        <Edit />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {canDelete && (
                                <Tooltip title="Delete">
                                    <IconButton color="error" onClick={() => handleDelete(row.uuid)}>
                                        <Trash />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    )
                }
            ]
            : [])
    ];


    // if (error) {
    //     return (
    //         <MainCard sx={{ borderRadius: 2 }}>
    //             <Box p={3} color="error.main">
    //                 Error: {error}
    //             </Box>
    //         </MainCard>
    //     );
    // }
    console.log("test items", items)

    return (
        <MainCard>
            {subHeaderComponentMemo}
            <Box sx={{ overflowx: 'auto', "&::-webkit-scrollbar": { height: '24px' }, maxWidth: 1500 }}>

                <DataTable
                    columns={columns}
                    data={filteredItems}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 20, 30]}
                    highlightOnHover
                    progressPending={loading}
                    responsive
                    fixedHeader
                    persistTableHead

                />

                {/* /Edit Webinar Dialog */}
                <Dialog

                    maxWidth="xl"
                    TransitionComponent={PopupTransition}
                    keepMounted
                    fullWidth
                    open={open}
                    onClose={(webinar, reason) => {
                        if (reason !== 'backdropClick') handleClose();
                    }}
                    BackdropProps={{
                        onClick: (webinar) => webinar.stopPropagation()
                    }}
                    sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle className="dialogTitle">

                        {/* <Button variant="contained" onClick={handleClose}>
                                        Close
                                    </Button> */}

                        <Grid container>
                            <Grid
                                item
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto 1fr',
                                    alignItems: 'center',
                                    width: '100%',
                                }}
                            >
                                {/* Left spacer */}
                                <Box />

                                {/* Center title */}
                                {/* <Typography fontWeight={600} textAlign="center">
                                {currentWebinar
                                    ? currentWebinar.viewOnly
                                        ? 'View Webinar'
                                        : 'Edit Webinar'
                                    : ''}
                            </Typography> */}

                                {/* Right close icon */}
                                {/* <Grid container spacing={1} xs={12} md={6}> */}
                                {/* Left spacer */}
                                {/* <Box /> */}

                                {/* Center title */}
                                <Typography fontWeight={600} textAlign="center" justifyContent={"center"}>
                                    Edit Webinar
                                </Typography>

                                {/* Right close button */}
                                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                    <IconButton onClick={handleClose}>
                                        <CloseSquare style={{ pointerEvents: "none" }} />
                                    </IconButton>
                                </Box>
                                {/* </Grid> */}

                            </Grid>

                            <Grid item>
                                <DialogContent>
                                    <form onSubmit={formik.handleSubmit}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <Grid container spacing={2} sx={{ mt: 1 }}>

                                                {/* Title */}
                                                <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                    <Stack spacing={1}>
                                                        <Typography fontweight={400}>Title *</Typography>
                                                        <TextField
                                                            fullWidth
                                                            name="webinarName"
                                                            placeholder="e.g., Annual Conference, Webinar on AI"
                                                            // value={formik.values.webinarName}
                                                            // onChange={formik.handleChange}
                                                            // onChange={(e) => setTitle(e.target.value)}
                                                            value={title}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setTitle(value);
                                                                setSlug(generateSlug(value));
                                                            }}
                                                        // onBlur={formik.handleBlur}
                                                        // error={formik.touched.webinarName && Boolean(formik.errors.webinarName)}
                                                        // helperText={formik.touched.webinarName && formik.errors.webinarName}
                                                        // disabled={currentWebinar?.viewOnly}
                                                        />
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                    <Typography fontWeight={400}> Slug</Typography>
                                                    <TextField
                                                        fullWidth
                                                        name="slug"
                                                        // value={formik.values.slug}
                                                        placeholder='eg: Enter slug'
                                                        // onChange={formik.handleChange}
                                                        value={slug}
                                                    // onChange={(e) =>

                                                    //     setSlug(generateslug(e.target.value))


                                                    // }
                                                    />

                                                </Grid>

                                                {/* Subtitle */}
                                                <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                    <Stack spacing={1}>
                                                        <Typography fontweight={400}>Sub Title *</Typography>
                                                        <TextField
                                                            fullWidth
                                                            name="webinarSubtitle"
                                                            placeholder="e.g., Learn AI Basics"
                                                            value={subtitle}
                                                            onChange={(e) => {

                                                                setSubtitle(e.target.value);

                                                            }}
                                                        // value={formik.values.webinarSubtitle}
                                                        // onChange={formik.handleChange}
                                                        // onBlur={formik.handleBlur}
                                                        // error={formik.touched.webinarSubtitle && Boolean(formik.errors.webinarSubtitle)}
                                                        // helperText={formik.touched.webinarSubtitle && formik.errors.webinarSubtitle}
                                                        // disabled={currentWebinar?.viewOnly}
                                                        />
                                                    </Stack>
                                                </Grid>

                                                {/* Description */}
                                                <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                    <Stack spacing={1}>
                                                        <Typography fontweight={400}>Key *</Typography>
                                                        <TextField
                                                            fullWidth

                                                            rows={4}
                                                            name="webinarDescription"
                                                            placeholder="Describe the webinar details..."
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                        // value={formik.values.webinarDescription}
                                                        // onChange={formik.handleChange}
                                                        // onBlur={formik.handleBlur}
                                                        // error={formik.touched.webinarDescription && Boolean(formik.errors.webinarDescription)}
                                                        // helperText={formik.touched.webinarDescription && formik.errors.webinarDescription}
                                                        // disabled={currentWebinar?.viewOnly}
                                                        />
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={6} sx={{ pt: 2 }}>
                                                    <Stack spacing={1}>
                                                        <Typography fontWeight={400}>Webinar Image</Typography>

                                                        <Button component="label" variant="contained">
                                                            Upload Image
                                                            <input
                                                                hidden
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (!file) return;
                                                                    setWebinarimage(file);

                                                                    // formik.setFieldValue('webinarImage', file);

                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setImagePreviewweb(reader.result);
                                                                    reader.readAsDataURL(file);
                                                                }}
                                                            />
                                                        </Button>



                                                        {imagePreviewweb && (
                                                            <Grid item xs={12} md={6} sx={{ p: 1 }}>
                                                                <Typography fontWeight={600}>Webinar Image Preview</Typography>
                                                                <img
                                                                    src={imagePreviewweb}
                                                                    alt="webinar Preview"
                                                                    width={120}
                                                                    style={{ borderRadius: 8, marginTop: 8 }}
                                                                />
                                                            </Grid>
                                                        )}
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={6} sx={{ pt: 1 }}>
                                                    <Stack spacing={1}>
                                                        <Grid item xs={12} md={6} sx={{ p: 2 }}>

                                                            <Button
                                                                startIcon={< YouTubeIcon />}
                                                                variant="outlined"
                                                                onClick={() => setOpenVideoDialog(true)}
                                                            >
                                                                Add YouTube Video
                                                            </Button>

                                                        </Grid>
                                                        {videoUrl && (
                                                            // <Grid container spacing={2}>
                                                            <Grid item xs={12} md={6} sx={{ p: 1 }}>

                                                                <Typography fontWeight={600}>YouTube Preview</Typography>



                                                                <Box mt={1} sx={{ position: "relative", paddingTop: "5%" }}>
                                                                    <iframe
                                                                        src={`https://www.youtube.com/embed/${getYoutubeId(videoUrl)}`}
                                                                        width={120}
                                                                        style={{ borderRadius: 8, marginTop: 8 }}
                                                                        frameBorder="0"
                                                                        allowFullScreen
                                                                        title="YouTube Video"
                                                                    />
                                                                </Box>

                                                            </Grid>
                                                            // </Grid>
                                                        )}
                                                        <Grid item xs={5}>
                                                            <Dialog
                                                                open={openVideoDialog}
                                                                onClose={() => setOpenVideoDialog(false)}
                                                                maxWidth="sm"
                                                                fullWidth
                                                            >
                                                                <Grid item xs={12} sx={{ p: 2 }}>
                                                                    <Typography fontWeight={400}>Add YouTube Video</Typography>
                                                                </Grid>
                                                                <DialogContent>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="YouTube Video URL"
                                                                        placeholder="https://www.youtube.com/watch?v=xxxxx"
                                                                        value={videoUrl}
                                                                        onChange={(e) => setVideoUrl(e.target.value)}
                                                                        margin="dense"
                                                                    />
                                                                </DialogContent>

                                                                <DialogActions>
                                                                    <Button onClick={() => setOpenVideoDialog(false)}>Cancel</Button>

                                                                    <Button
                                                                        variant="contained"
                                                                        onClick={() => {
                                                                            // formik.setFieldValue("videoUrl", videoUrl);
                                                                            // setVideoUrl();
                                                                            setOpenVideoDialog(false);
                                                                        }}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </DialogActions>
                                                            </Dialog>

                                                        </Grid>
                                                    </Stack>
                                                </Grid>

                                                {/* Date Time */}
                                                <Grid item xs={12} sx={{ pt: 1 }}>
                                                    <Stack spacing={1}>
                                                        <Typography fontweight={400}> Date & Time *</Typography>
                                                        <DateTimePicker
                                                            value={formik.values.webinarDateTime}
                                                            disablePast
                                                            onChange={(date) =>
                                                                formik.setFieldValue('webinarDateTime', date)
                                                            }
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    error:
                                                                        formik.touched.webinarDateTime &&
                                                                        Boolean(formik.errors.webinarDateTime),
                                                                    helperText:
                                                                        formik.touched.webinarDateTime &&
                                                                        formik.errors.webinarDateTime,
                                                                },
                                                            }}
                                                        />
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={6} sx={{ pt: 1 }}>
                                                    <Stack spacing={1}>
                                                        <Typography fontWeight={400}>Mode Type</Typography>
                                                        <RadioGroup
                                                            row
                                                            value={mode}
                                                            onChange={(e) => setMode(e.target.value === "true")}
                                                        >
                                                            <FormControlLabel
                                                                value="false"
                                                                control={<Radio />}
                                                                label="Offline"
                                                            />

                                                            <FormControlLabel
                                                                value="true"
                                                                control={<Radio />}
                                                                label="Online"
                                                            />
                                                        </RadioGroup>



                                                    </Stack>
                                                </Grid>

                                                {/* Webinar Type */}
                                                <Grid item xs={12} md={6} sx={{ pt: 2 }}>
                                                    <Stack spacing={1}>
                                                        <Typography fontweight={400}>Webinar Type *</Typography>

                                                        <Grid display="flex" gap={2}>
                                                            <ButtonBase
                                                                onClick={() => formik.setFieldValue('webinarType', 'Free')}
                                                                sx={{
                                                                    border: '2px solid',
                                                                    borderColor:
                                                                        formik.values.webinarType === 'Free'
                                                                            ? 'primary.main'
                                                                            : 'grey.400',
                                                                    bgcolor:
                                                                        formik.values.webinarType === 'Free'
                                                                            ? 'primary.light'
                                                                            : 'grey.100',
                                                                    px: 3,
                                                                    py: 1.5,
                                                                    borderRadius: 2,
                                                                }}
                                                            >
                                                                <Typography fontWeight={600}>FREE WEBINAR</Typography>
                                                            </ButtonBase>

                                                            <ButtonBase
                                                                onClick={() => formik.setFieldValue('webinarType', 'Paid')}
                                                                sx={{
                                                                    border: '2px solid',
                                                                    borderColor:
                                                                        formik.values.webinarType === 'Paid'
                                                                            ? 'success.main'
                                                                            : 'grey.400',
                                                                    bgcolor:
                                                                        formik.values.webinarType === 'Paid'
                                                                            ? 'success.light'
                                                                            : 'grey.100',
                                                                    px: 3,
                                                                    py: 1.5,
                                                                    borderRadius: 2,
                                                                }}
                                                            >
                                                                <Typography fontWeight={600}>PAID WEBINAR</Typography>
                                                            </ButtonBase>
                                                        </Grid>

                                                        {formik.touched.webinarType && formik.errors.webinarType && (
                                                            <Typography color="error" variant="caption">
                                                                {formik.errors.webinarType}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </Grid>

                                                {/* Paid Fields */}
                                                {formik.values.webinarType === 'Paid' && (
                                                    <>
                                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                            <Stack spacing={1}>
                                                                <Typography fontweight={400}>Regular Price *</Typography>
                                                                <TextField
                                                                    fullWidth

                                                                    type="number"
                                                                    name="regular_price"
                                                                    value={formik.values.regular_price}
                                                                    onChange={formik.handleChange}
                                                                />
                                                            </Stack>
                                                        </Grid>

                                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                            <Stack spacing={1}>
                                                                <Typography fontWeight={400}>Sale Price (Optional)</Typography>
                                                                <TextField
                                                                    fullWidth
                                                                    type="number"
                                                                    name="price"
                                                                    value={formik.values.price}
                                                                    onChange={formik.handleChange}
                                                                />
                                                            </Stack>
                                                        </Grid>
                                                    </>
                                                )}








                                                {/* Meta Fields */}
                                                <Grid xs={12} md={6} sx={{ pt: 3, pl: 3 }}>
                                                    <Typography fontWeight={600}>Seo</Typography>
                                                    <Paper

                                                        sx={{ p: 4, display: 'flex', gap: 2, alignItems: 'center' }}
                                                    >

                                                        <Grid item xs={12} md={6} sx={{ pt: 3, pl: 3 }}>

                                                            <Stack spacing={2}>

                                                                <Typography fontWeight={400}>Meta Title</Typography>
                                                                <TextField
                                                                    fullWidth
                                                                    name="metatitle"
                                                                    value={metatitle}
                                                                    placeholder='eg:Python'
                                                                    onChange={(e) => setMetatitle(e.target.value)}
                                                                // value={formik.values.metatitle}
                                                                // onChange={formik.handleChange}
                                                                />
                                                            </Stack>
                                                        </Grid>

                                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                            <Stack spacing={2}>
                                                                <Typography fontWeight={400}>Meta Image</Typography>

                                                                <Button component="label" variant="contained">
                                                                    Upload Image
                                                                    <input
                                                                        hidden
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files[0];
                                                                            if (!file) return;

                                                                            // formik.setFieldValue('metaImage', file);
                                                                            setMetaimg(file);

                                                                            const reader = new FileReader();
                                                                            reader.onloadend = () => setImagePreview(reader.result);
                                                                            reader.readAsDataURL(file);
                                                                        }}
                                                                    />
                                                                </Button>

                                                                {imagePreview && (
                                                                    <img
                                                                        src={imagePreview}
                                                                        alt="Meta Preview"
                                                                        width={120}
                                                                        style={{ borderRadius: 8, marginTop: 8 }}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </Grid>




                                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                            <Stack spacing={2}>
                                                                <Typography fontWeight={400}>Meta Description</Typography>
                                                                <TextField
                                                                    fullWidth
                                                                    multiline
                                                                    rows={3}
                                                                    name="metadescription"
                                                                    placeholder='eg:Python description'
                                                                    // value={formik.values.metadescription}
                                                                    // onChange={formik.handleChange}
                                                                    value={metadesc}
                                                                    onChange={(e) => setMetadesc(e.target.value)}
                                                                />
                                                            </Stack>
                                                        </Grid>
                                                    </Paper>
                                                </Grid>
                                            </Grid>


                                            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                                <Grid item xs={12} md={4} sx={{ pt: 4 }}>
                                                    <Stack spacing={2}>
                                                        <Typography fontWeight={400}> Mentor</Typography>
                                                        <TextField
                                                            fullWidth
                                                            name="mentor"
                                                            value={formik.values.mentor}
                                                            placeholder='eg: Jhon'
                                                            onChange={formik.handleChange}

                                                        />
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={4} sx={{ pt: 4 }}>
                                                    <Stack spacing={2}>
                                                        <Typography fontWeight={400}>Language</Typography>
                                                        {/* <InputLabel id="language-label">Language</InputLabel> */}
                                                        <Select
                                                            // labelId='language-label'
                                                            name='language'

                                                            label='language'
                                                            displayEmpty
                                                            value={language}
                                                            onChange={(e) => setLanguage(e.target.value)}
                                                        >
                                                            <MenuItem value="" disabled>
                                                                <em>Select a Language</em>
                                                            </MenuItem>
                                                            <MenuItem value="english"> English</MenuItem>
                                                            <MenuItem value="tamil" >Tamil</MenuItem>


                                                        </Select>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={4} sx={{ pt: 4 }}>
                                                    <Stack spacing={2}>
                                                        <Typography fontWeight={400}>Status</Typography>
                                                        <Select
                                                            name='status'
                                                            label='status'
                                                            displayEmpty
                                                            value={status}
                                                            onChange={(e) => setStatus(e.target.value)}>
                                                            <MenuItem value="" disabled>
                                                                <em> Select Webinar Status</em>
                                                            </MenuItem>
                                                            <MenuItem value={true}> Active</MenuItem>
                                                            <MenuItem value={false}>Inactive</MenuItem>
                                                        </Select>
                                                    </Stack>
                                                </Grid>
                                            </Grid>

                                            {/* Tools */}

                                            {!editToolsOpen ?
                                                <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                    <Typography fontWeight={600}>Add Tools</Typography>

                                                    <Stack spacing={2} mt={1}>

                                                        {items && items.length > 0 && items.map((item, index) => (
                                                            <Paper
                                                                key={index}
                                                                elevation={2}
                                                                sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}
                                                            >
                                                                <TextField
                                                                    size="small"
                                                                    label="Title"
                                                                    value={item.title}
                                                                    onChange={(e) =>
                                                                        handleTitleChange(index, e.target.value)
                                                                    }
                                                                />

                                                                <Button component="label" variant="outlined">
                                                                    Upload Image
                                                                    <input
                                                                        hidden
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) =>
                                                                            handleFileChange(index, e.target.files[0])
                                                                        }
                                                                    />
                                                                </Button>

                                                                {item.preview && (
                                                                    <img
                                                                        src={item.preview}
                                                                        width={48}
                                                                        height={48}
                                                                        style={{ borderRadius: 6 }}
                                                                        alt="preview"
                                                                    />
                                                                )}

                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    type='remove'
                                                                    onClick={() => handleRemove(index)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </Paper>
                                                        ))}

                                                        <Button startIcon={<AddIcon />} onClick={handleAdd}>
                                                            Add More
                                                            {/* </AddIcon> */}
                                                        </Button>
                                                    </Stack>
                                                </Grid> :
                                                <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                    <Typography fontWeight={600}>Add Tools</Typography>

                                                    <Stack spacing={2} mt={1}>

                                                        {editTools && editTools.length > 0 && editTools.map((item, index) => {
                                                            return (!item.isDelete &&
                                                                <Paper
                                                                    key={item.id}
                                                                    elevation={2}
                                                                    sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}
                                                                >
                                                                    <TextField
                                                                        size="small"
                                                                        label="Title"
                                                                        value={item.title}
                                                                        onChange={(e) =>
                                                                            handleEditTitleChange(index, e.target.value)
                                                                        }
                                                                    />

                                                                    <Button component="label" variant="outlined">
                                                                        Upload Image
                                                                        <input
                                                                            hidden
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) =>
                                                                                handleEditFileChange(index, e.target.files[0])
                                                                            }
                                                                        />
                                                                    </Button>

                                                                    {item.preview && (
                                                                        <img
                                                                            src={item.preview}
                                                                            width={48}
                                                                            height={48}
                                                                            style={{ borderRadius: 6 }}
                                                                            alt="preview"
                                                                        />
                                                                    )}

                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        type='remove'
                                                                        onClick={() => handleEditRemove(index)}
                                                                    >
                                                                        Remove
                                                                    </Button>

                                                                </Paper>
                                                            )
                                                        })}
                                                        <Button startIcon={<AddIcon />} onClick={handleEditAdd}>
                                                            Add More
                                                            {/* </AddIcon> */}
                                                        </Button>






                                                    </Stack>
                                                </Grid>

                                            }

                                            <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                                <Typography fontWeight={600}>Add FaQ</Typography>

                                                <Stack spacing={2} mt={1}>
                                                    {faqs && faqs.length > 0 && faqs.map((faqs, index) => (
                                                        <Paper
                                                            key={index}
                                                            elevation={2}
                                                            sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}
                                                        >
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                // size="small"
                                                                label="Question"
                                                                value={faqs.question}
                                                                onChange={(e) =>
                                                                    handleQuestionChange(index, e.target.value)
                                                                }
                                                            />

                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={3}
                                                                label="Answer"
                                                                value={faqs.answer}
                                                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                            />

                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                type='remove'
                                                                onClick={() => handleFaqremove(index)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </Paper>
                                                    ))}

                                                    <Button startIcon={<AddIcon />} onClick={handleFaqadd}>
                                                        Add More
                                                        {/* </AddIcon> */}
                                                    </Button>
                                                </Stack>
                                            </Grid>

                                        </LocalizationProvider>

                                        {!currentWebinar?.viewOnly && (
                                            <DialogActions sx={{ mt: 3 }}>
                                                <Button onClick={handleClose}>Cancel</Button>
                                                <Button type="submit" variant="contained">
                                                    {currentWebinar ? 'Update' : 'Submit'}
                                                </Button>
                                            </DialogActions>
                                        )}

                                        {currentWebinar?.viewOnly && (
                                            <DialogActions sx={{ mt: 3 }}>
                                                <Button variant="contained" onClick={handleClose}>
                                                    Close
                                                </Button>
                                            </DialogActions>
                                        )}
                                    </form>
                                </DialogContent>

                            </Grid>
                        </Grid>



                    </DialogTitle>





                </Dialog>

                <Dialog

                    maxWidth="xl"
                    TransitionComponent={PopupTransition}
                    keepMounted
                    fullWidth
                    open={viewOpen}
                    // onClose={(webinar, reason) => {
                    //     if (reason !== 'backdropClick') handleViewClose();
                    // }}
                    BackdropProps={{
                        onClick: (webinar) => webinar.stopPropagation()
                    }}
                    sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogContent >
                        <Grid
                            item
                            sx={{
                                display: 'flex',
                                gridTemplateColumns: '1fr auto 1fr',
                                alignItems: 'center',
                                width: '100%',
                                // overflowY:'hidden'
                            }}
                        >

                            {/* Left spacer */}
                            <Box />


                            <Grid container >
                                <Grid
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "auto 1fr auto",
                                        alignItems: "center",
                                        width: "100%",
                                        px: 2,
                                    }}
                                >
                                    <Box />
                                    <Typography fontWeight={600} textAlign="center" justifyContent={"center"}>
                                        {"View Details"}
                                    </Typography>


                                    {/* Right close icon */}
                                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                        <IconButton onClick={handleViewClose}>
                                            <CloseSquare style={{ pointerEvents: "none" }} />
                                        </IconButton>
                                    </Box>
                                </Grid>

                                {/* </DialogContent> */}
                                <DialogTitle className="dialogTitle">
                                    <Grid container spacing={2} sx={{ p: 3 }}>
                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                            <Stack spacing={1}>
                                                <Typography fontweight={400}>Title *</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.title}
                                                </Typography>

                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                            <Stack spacing={1}>
                                                <Typography fontWeight={400}> Slug</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.slug}
                                                </Typography>
                                            </Stack>

                                        </Grid>

                                        {/* Subtitle */}
                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                            <Stack spacing={1}>
                                                <Typography fontweight={400}>Sub Title *</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.sub_title}

                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                            <Stack spacing={1}>
                                                <Typography fontweight={400}>Key *</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.description}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6} sx={{ pt: 2 }}>
                                            <Stack spacing={1}>
                                                <Typography fontWeight={400}><strong>Webinar Image</strong></Typography>
                                                {viewDetails?.webinar_image_url && (
                                                    <Grid item xs={12} md={6} sx={{ p: 1 }}>
                                                        <img
                                                            src={viewDetails && viewDetails?.webinar_image_url}
                                                            alt="webinar Preview"
                                                            width={300}
                                                            style={{ borderRadius: 8, marginTop: 8 }}
                                                        />
                                                    </Grid>
                                                )}
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Typography component="div">
                                                <strong>YouTube URL</strong>


                                            </Typography>
                                            {viewDetails?.video_url && (
                                                <Box
                                                    component="iframe"
                                                    src={`https://www.youtube.com/embed/${viewDetails?.video_url}`}
                                                    style={{ borderRadius: 8, marginTop: 10 }}
                                                    allowFullScreen
                                                />
                                            )}
                                        </Grid>

                                        {/* </Grid> */}
                                        {/* <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}> */}
                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                            <Stack spacing={2}>
                                                <Typography fontWeight={400}>Regular Price:</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.regular_price}
                                                </Typography>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                            <Stack spacing={2}>
                                                <Typography fontWeight={400}> Sale Price:</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.price}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        {/* </Grid> */}
                                        {/* <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}> */}

                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                            <Stack spacing={2}>
                                                <Typography fontWeight={400}> Date & Time</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.scheduled_start}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                            <Stack spacing={2}>
                                                <Typography fontWeight={400}>Mode</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.mode == true ? "Online" : "Offline"}
                                                </Typography>

                                            </Stack>
                                        </Grid>
                                        {/* </Grid> */}

                                        {/* <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}> */}
                                        <Grid item xs={12} md={4} sx={{ pt: 4 }}>
                                            <Stack spacing={2}>
                                                <Typography fontWeight={400}> Mentor</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.mentor}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={4} sx={{ pt: 4 }}>
                                            <Stack spacing={2}>
                                                <Typography fontWeight={400}>Language</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails?.language || "-"}
                                                </Typography>
                                            </Stack>
                                        </Grid>

                                        {/* </Grid> */}
                                        <Grid item xs={12} md={4} sx={{ pt: 4 }}>
                                            <Stack spacing={2}>
                                                <Typography fontWeight={400}>Status</Typography>
                                                <Typography
                                                    sx={{
                                                        p: 1.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1,
                                                        minHeight: 45,
                                                        backgroundColor: "#f9f9f9",
                                                    }}
                                                >
                                                    {viewDetails && viewDetails?.webinar_status == true ? "Active" : "In Active"}
                                                </Typography>

                                            </Stack>
                                        </Grid>
                                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{ pt: 2 }}>
                                            
                                            <Grid item xs={12} md={6} sx={{ pt: 4 }}>
                                                <Stack spacing={2}>
                                                    {/* <Box> */}
                                                    <Typography>
                                                        <strong>
                                                            Meta Title:
                                                        </strong>

                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            p: 1.5,
                                                            border: "1px solid #e0e0e0",
                                                            borderRadius: 1,
                                                            minHeight: 45,
                                                            backgroundColor: "#f9f9f9",
                                                        }}
                                                    >
                                                        {viewDetails && viewDetails?.metadata[0] && viewDetails?.metadata[0]?.meta_title}
                                                    </Typography>
                                                </Stack>
                                            </Grid>

                                            <Grid item xs={12} md={6} sx={{ pt: 4 }}>
                                                <Stack spacing={2}>
                                                    <Typography>
                                                        <strong>
                                                            Meta Description:
                                                        </strong>

                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            p: 1.5,
                                                            border: "1px solid #e0e0e0",
                                                            borderRadius: 1,
                                                            minHeight: 45,
                                                            backgroundColor: "#f9f9f9",
                                                        }}
                                                    >
                                                        {viewDetails && viewDetails?.metadata[0] && viewDetails?.metadata[0]?.meta_description}
                                                    </Typography>
                                                </Stack>
                                            </Grid>

                                            <Grid item xs={12} md={6} sx={{ pt: 4 }}>
                                                <Stack spacing={2}>
                                                    <Typography>
                                                        <strong>Meta Image:</strong>
                                                    </Typography>



                                                    {viewDetails?.metadata[0]?.meta_image && (
                                                        <Box
                                                            component="img"
                                                            src={viewDetails.metadata[0].image_url}
                                                            alt="metaimage"
                                                            sx={{
                                                                width: 200,
                                                                mt: 1,
                                                                borderRadius: 2,
                                                                border: "1px solid #ddd",
                                                            }}
                                                        />
                                                    )}
                                                    {/* </Box> */}
                                                </Stack>
                                            </Grid>

                                        </Grid>
                                        <Grid container spacing={3}>
                                            {
                                                viewDetails && viewDetails?.tools.length > 0 && viewDetails?.tools.map((item, index) => {
                                                    return (

                                                        <Grid items xs={5} key={index}>
                                                            <Grid item xs={12} md={6} sx={{ pt: 4 }}>

                                                                <Stack spacing={2}>
                                                                    <Typography>
                                                                        <strong>
                                                                            Tool title:
                                                                        </strong>
                                                                    </Typography>
                                                                    <Typography
                                                                        sx={{
                                                                            p: 1.5,
                                                                            border: "1px solid #e0e0e0",
                                                                            borderRadius: 1,
                                                                            minHeight: 45,
                                                                            backgroundColor: "#f9f9f9",
                                                                        }}
                                                                    >
                                                                        {item?.tools_title || " -"}
                                                                    </Typography>
                                                                </Stack>

                                                            </Grid>
                                                            <Grid item xs={12} md={6} sx={{ pt: 4 }}>
                                                                {/* <Grid item xs={12} md={6}> */}
                                                                <Stack spacing={2}>
                                                                    <Typography>
                                                                        <strong>
                                                                            Tool Image:
                                                                        </strong>
                                                                        {/* {item?.tools_image || " -"} */}

                                                                        <Box
                                                                            component="img"
                                                                            src={item?.image_url}
                                                                            alt="Tool Image"
                                                                            sx={{
                                                                                width: 200,
                                                                                mt: 1,
                                                                                borderRadius: 2,
                                                                                border: "1px solid #ddd",
                                                                            }}
                                                                        />

                                                                    </Typography>
                                                                </Stack>
                                                                {/* </Grid> */}
                                                            </Grid>

                                                        </Grid>
                                                    )
                                                })


                                            }
                                        </Grid>
                                        <Grid container spacing={3}>
                                            {viewDetails?.faqs?.map((item, index) => (
                                                <Grid item xs={12} md={6} key={index}>   {/* 👈 Wider */}
                                                    <Stack spacing={2} sx={{ pt: 3 }}>

                                                        <Typography>
                                                            <strong>Faq Question:</strong>
                                                        </Typography>

                                                        <Typography
                                                            sx={{
                                                                p: 1.5,
                                                                border: "1px solid #e0e0e0",
                                                                borderRadius: 1,
                                                                minHeight: 60,
                                                                width: "100%",
                                                                backgroundColor: "#f9f9f9",
                                                            }}
                                                        >
                                                            {item?.question || "-"}
                                                        </Typography>

                                                        <Typography>
                                                            <strong>Faq Answer:</strong>
                                                        </Typography>

                                                        <Typography
                                                            sx={{
                                                                p: 1.5,
                                                                border: "1px solid #e0e0e0",
                                                                borderRadius: 1,
                                                                minHeight: 80,
                                                                width: "100%",
                                                                backgroundColor: "#f9f9f9",
                                                            }}
                                                        >
                                                            {item?.answer || "-"}
                                                        </Typography>

                                                    </Stack>
                                                </Grid>
                                            ))}
                                        </Grid>




                                    </Grid>

                                </DialogTitle>

                                {/* </Grid> */}
                                {/* </DialogTitle> */}
                                {/* <WebinarFeedbackDialog
                open={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
                webinarUuid={selectedWebinarUuid}
            /> */}
                            </Grid>

                        </Grid>
                    </DialogContent>




                </Dialog>

            </Box >
        </MainCard >

    );
};
export default WebinarList;