import React from 'react';
import {
    Grid,
    TextField,
    Button,
    Stack,
    Typography,
    MenuItem,Paper,Radio,FormControlLabel,ButtonBase,Dialog,DialogContent,Box,Select
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router';
import YouTubeIcon from '@mui/icons-material/YouTube';

const WebinarForm = () => {
    const navigate = useNavigate();

    return (
        <MainCard title="Add Webinar">
            <form>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <Typography>Title</Typography>
                            <TextField fullWidth />
                        </Stack>
                    </Grid>
                    {/* Title */}
                    <Grid item xs={12} sx={{ pt: 3 }}>
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
                    <Grid item sx={{ pt: 3 }}>
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
                    <Grid item xs={12} sx={{ pt: 3 }}>
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
                    <Grid item xs={12} sx={{ pt: 3 }}>
                        <Stack spacing={1}>
                            <Typography fontweight={400}>Description *</Typography>
                            <TextField
                                fullWidth
                                multiline
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
                    <Grid item xs={12} sx={{ pt: 3 }}>
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
                                <img
                                    src={imagePreviewweb}
                                    alt="webinar Preview"
                                    width={120}
                                    style={{ borderRadius: 8, marginTop: 8 }}
                                />
                            )}
                        </Stack>
                    </Grid>
                    <Grid item sx={{ pt: 3 }}>
                        <Button
                            startIcon={< YouTubeIcon />}
                            variant="outlined"
                            onClick={() => setOpenVideoDialog(true)}
                        >
                            Add YouTube Video
                        </Button>
                    </Grid>
                    {formik.values.videoUrl && (
                        <Grid item xs={12} sx={{ pt: 3 }}>
                            <Typography fontWeight={600}>YouTube Preview</Typography>

                            <Box mt={1} sx={{ position: "relative", paddingTop: "56.25%" }}>
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYoutubeId(
                                        formik.values.videoUrl
                                    )}`}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 8,
                                    }}
                                    frameBorder="0"
                                    allowFullScreen
                                    title="YouTube Video"
                                />
                            </Box>
                        </Grid>
                    )}

                    {/* Date Time */}
                    <Grid item xs={12} md={6} sx={{ pt: 3 }}>
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
                    <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                        <Stack spacing={1}>
                            <Typography fontWeight={400}>Mode Type</Typography>
                            <RadioGroup
                                name="modetype"
                                value={modetype}
                            >
                                <FormControlLabel
                                    control={<Radio />}
                                    label="Offline"
                                    value="offline"
                                    checked={modetype === "offline"}
                                    onClick={() => setModetype("offline")}


                                />
                                <FormControlLabel
                                    control={<Radio />}
                                    label="Online"
                                    value="online"
                                    checked={modetype === "online"}
                                    onClick={() => setModetype("online")}
                                />
                            </RadioGroup>

                        </Stack>
                    </Grid>

                    {/* Webinar Type */}
                    <Grid item xs={12} md={6} sx={{ pt: 3 }}>
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
                                        name="regularprice"
                                        value={formik.values.regularprice}
                                        onChange={formik.handleChange}
                                    />
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                                <Stack spacing={2}>
                                    <Typography fontWeight={400}>Sale Price (Optional)</Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        name="saleprice"
                                        value={formik.values.saleprice}
                                        onChange={formik.handleChange}
                                    />
                                </Stack>
                            </Grid>
                        </>
                    )}




                    <Grid item xs={12} sx={{ pt: 3 }}>
                        <Dialog
                            open={openVideoDialog}
                            onClose={() => setOpenVideoDialog(false)}
                            maxWidth="sm"
                            fullWidth
                        >
                            <Typography fontWeight={400}>Add YouTube Video</Typography>

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
                                        formik.setFieldValue("videoUrl", videoUrl);
                                        setVideoUrl("");
                                        setOpenVideoDialog(false);
                                    }}
                                >
                                    Add
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>



                    {/* Meta Fields */}
                    <Grid sx={{ pt: 3, pl: 3 }}>
                        <Typography fontweight={700}>Seo</Typography>
                        <Paper

                            sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center' }}
                        >

                            <Grid item xs={12} sx={{ pt: 3, pl: 3 }}>

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

                            <Grid item xs={12} sx={{ pt: 3 }}>
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




                            <Grid item xs={12} sx={{ pt: 3 }}>
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



                <Grid item xs={12} sx={{ pt: 3 }}>
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
                <Grid item xs={12} sx={{ pt: 3 }}>
                    <Typography fontWeight={400}>Language</Typography>
                    {/* <InputLabel id="language-label">Language</InputLabel> */}
                    <Select
                        // labelId='language-label'
                        name='language'
                        fullWidth
                        label='language'
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <MenuItem value="" disabled>
                            <em>Select Language</em>
                        </MenuItem>
                        <MenuItem value="en"> English</MenuItem>
                        <MenuItem value="ta" >Tamil</MenuItem>


                    </Select>

                </Grid>

                {/* Tools */}
                <Grid item xs={12} sx={{ pt: 3 }}>
                    <Typography fontWeight={600}>Add Tools</Typography>

                    <Stack spacing={2} mt={1}>
                        {items.map((item, index) => (
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
                </Grid>
                <Grid item xs={12} sx={{ pt: 3 }}>
                    <Typography fontWeight={600}>Add FaQ</Typography>

                    <Stack spacing={2} mt={1}>
                        {items.map((faq, index) => (
                            <Paper
                                key={index}
                                elevation={2}
                                sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}
                            >
                                <TextField
                                    size="small"
                                    label="Question"
                                    value={faq.question}
                                    onChange={(e) =>
                                        handleQuestionChange(index, e.target.value)
                                    }
                                />

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Answer"
                                    value={faq.answer}
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

                <Grid item xs={12}>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                        >
                            Submit
                        </Button>
                    </Stack>
                </Grid>
           
        </form>
    </MainCard >
  );
};

export default WebinarForm;
