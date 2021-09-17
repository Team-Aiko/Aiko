import React, {useState} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import styles from '../styles/signup.module.css';
import {makeStyles} from '@material-ui/core/styles';
import {Grow, Avatar, Button, Typography, Container, TextField} from '@material-ui/core';
import {files, account, strings} from 'web-snippets';
import {get, post} from 'axios';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import Autocomplete from '@material-ui/lab/Autocomplete';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import Router from 'next/router';

const useStyles = makeStyles(theme => ({
    avatarStyle: {
        width: theme.spacing(10),
        height: theme.spacing(10),
        cursor: 'pointer',
    },
    formControl: {
        margin: theme.spacing(1),
        width: 222.667,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));
export default function ContainerComp() {
    return <Signup />;
}

function Signup() {
    const classes = useStyles();
    const [image, setImage] = useState('../static/testImages/kotone.png');
    const [fileObj, setFileObj] = useState(undefined);
    const [step, setStep] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [pwCf, setPwCf] = useState('');
    const [tel, setTel] = useState('');
    const [errFirstName, setErrFirstName] = useState(true);
    const [errLastName, setErrLastName] = useState(true);
    const [errNickname, setErrNickname] = useState(true);
    const [errTel, setErrTel] = useState(true);
    const [errPw, setErrPw] = useState(true);
    const [errPwCf, setErrPwCf] = useState(true);
    const [errEmail, setErrEmail] = useState(true);
    const [errCompanyName, setErrCompanyName] = useState(true);
    const [position, setPosition] = useState(-1);
    const [companyName, setCompanyName] = useState('');
    const [countryName, setCountryName] = useState('');
    const [countryPK, setCountryPK] = useState(-1);
    const [companyPK, setCompanyPK] = useState(-1);
    const [companyList, setCompanyList] = useState([]);
    const [countryList, setCountryList] = useState([]);

    const handleFileUploader = () => {
        const uploader = document.getElementById('profileFile');
        uploader.click();
    };

    const handleFileChange = () => {
        const uploader = document.getElementById('profileFile');
        const fileName = uploader.files[0].name;
        const fileSize = uploader.files[0].size;
        const {isValid, errMessage} = files.imageValid(uploader.files[0], '3mb');

        if (isValid) {
            const imageURL = URL.createObjectURL(uploader.files[0]);
            setImage(imageURL);
            setFileObj(uploader.files[0]);
        }
    };

    const checkValidationStrings = e => {
        const str = e.target.value;
        const id = e.target.id;

        switch (id) {
            case 'first_name':
                const obj1 = account.cValid(str, 0, 30);

                if (!obj1.isValid) alert(obj1.errMessage);
                setErrFirstName(!obj1.isValid);
                setFirstName(str);
                break;
            case 'last_name':
                const obj2 = account.cValid(str, 0, 30);

                if (!obj2.isValid) alert(obj2.errMessage);
                setLastName(str);
                setErrLastName(!obj2.isValid);
                break;
            case 'company_name':
                const obj3 = account.cValid(str, 0, 100);
                setErrCompanyName(!obj3.isValid);
                setCompanyName(str);
                break;
            case 'tel':
                const isValidPhoneNum = account.cValidPhoneNum(str, 11) || account.cValidDashPhoneNum(str);

                setTel(str);
                setErrTel(!isValidPhoneNum);
                break;
        }
    };

    const checkValidationPw = e => {
        const pw = e.target.value;
        const {isValid, errMessage} = account.cValid(pw, 8, 30, ['special, capital, number']);

        setErrPw(!isValid);
        setPw(pw);
    };

    const checkValidationPwCf = e => {
        const typedPwCf = e.target.value;
        const {isValid} = account.confirmPw(pw, typedPwCf);
        console.log('🚀 ~ file: signup.js ~ line 144 ~ Signup ~ isValid', isValid);

        setErrPwCf(!isValid);
        setPwCf(typedPwCf);
    };

    const checkValidationEmail = e => {
        const typedEmail = e.target.value;
        const isValid = account.fullEmailValid(typedEmail);
        console.log('🚀 ~ file: signup.js ~ line 160 ~ Signup ~ isValid', isValid);

        setErrEmail(!isValid);

        if (isValid) {
            const url = '/api/account/checkDuplicateEmail?email=' + typedEmail;
            get(url).then(res => {
                const data = res.data;
                console.log('🚀 ~ file: signup.js ~ line 168 ~ get ~ data', data);
                setErrEmail(data[0]['COUNT(*)'] !== 0);
            });
        }

        setEmail(typedEmail);
    };

    const checkValidationNickname = e => {
        const typedNickname = e.target.value;
        const url = '/api/account/checkDuplicateNickname?nickname=' + typedNickname;

        get(url)
            .then(res => {
                const data = res.data;
                setErrNickname(data['COUNT(*)'] !== 0);
                setNickname(typedNickname);
            })
            .catch(e => console.log(e));
    };

    const goToNextStep = () => {
        console.log('goto next step');
        setStep(step + 1);
    };

    const goToPreviousStep = () => {
        setStep(step - 1);
    };

    const handlePositionChange = e => {
        const id = parseInt(e.target.value);
        setPosition(id); // -1: none, 0: owner, 1: member
    };

    const handleChangeCompany = e => {
        const company = e.target.value;

        if (company.length === 1) {
            const url = '/api/company/getCompanyList?str=' + company;
            get(url).then(res => {
                const data = res.data;
                const refinedData = data.map(curr => {
                    curr.COMPANY_NAME += ` ID: ${curr.COMPANY_PK}`;
                    return curr;
                });
                setCompanyList(refinedData);
            });
        }

        setCompanyName(company);

        if (!company) {
            setErrCompanyName(true);
        }
    };

    const handleCountry = e => {
        const country = e.target.value;
        console.log('🚀 ~ file: signup.js ~ line 203 ~ Signup ~ country', country);

        if (country.length === 1) {
            const url = '/api/account/getCountryList?str=' + country;
            get(url).then(res => {
                const data = res.data;
                setCountryList(data);
            });
        }

        setCountryName(country);
    };

    const fixCountry = (e, val) => {
        let targetCountry;
        countryList.some(curr => {
            if (curr.COUNTRY_NAME === val) {
                targetCountry = curr.COUNTRY_PK;
                console.log('🚀 ~ file: signup.js ~ line 221 ~ fixCountry ~ targetCountry', targetCountry);
                return true;
            }
        });
        setCountryPK(targetCountry);
    };

    const fixCompany = (e, val) => {
        console.log('실행중?');
        let targetCompany;
        companyList.some(curr => {
            if (curr.COMPANY_NAME === val) {
                targetCompany = curr.COMPANY_PK;
                setCompanyPK(targetCompany);
                setErrCompanyName(false);
                console.log('🚀 ~ file: signup.js ~ line 232 ~ fixCompany ~ targetCompany', targetCompany);
                return true;
            }
        });
    };

    const handleSubmit = () => {
        const isValidFirst =
            !errFirstName && !errLastName && !errNickname && !errPw && !errPwCf && !errEmail && !errTel;
        const url = '/api/account/signup';

        if (!isValidFirst) {
            alert('not valid sign up');
            return;
        }

        let totalValidation;
        if (countryPK <= -1) {
            alert('select your country');
            return;
        }

        const packet = {
            header: position,
            firstName: firstName,
            lastName: lastName,
            profile: image,
            nickname: nickname,
            email: email,
            countryPK: countryPK,
            tel: tel,
            pw: pw,
            position: position,
            companyName: companyName,
            companyPK: companyPK,
        };

        if (position === 0) {
            // owner
            const form = new FormData();
            totalValidation = isValidFirst && errCompanyName;
            form.append('obj', JSON.stringify(packet));
            form.append('image', fileObj);
            const config = {
                header: {
                    'content-type': 'multipart/form-data',
                },
            };
            post(url, form, config)
                .then(res => {
                    const isSuccess = res.data;
                    console.log('🚀 ~ file: signup.js ~ line 283 ~ handleSubmit ~ isSuccess', isSuccess);
                    if (isSuccess) Router.push('/');
                })
                .catch(err => console.log(err));
        } else {
            // member
            if (companyPK <= -1) {
                alert('select your company');
                return;
            }

            totalValidation = isValidFirst;
            if (totalValidation) {
                const form = new FormData();
                form.append('obj', JSON.stringify(packet));
                form.append('image', fileObj);
                const config = {
                    header: {
                        'content-type': 'multipart/form-data',
                    },
                };
                post(url, form, config)
                    .then(res => {
                        const isSuccess = res.data;
                        console.log('🚀 ~ file: signup.js ~ line 283 ~ handleSubmit ~ isSuccess', isSuccess);
                        if (isSuccess) Router.push('/');
                    })
                    .catch(err => console.log(err));
            }
        }
    };

    return (
        <React.Fragment>
            <div className={styles.wrapper}>
                <div className={styles.resizing}>
                    <CssBaseline />
                    {/* Step 1 */}
                    <Grow in={step === 0}>
                        <Container maxWidth='sm' style={{display: step === 0 ? 'block' : 'none'}}>
                            <Typography
                                component='div'
                                style={{backgroundColor: '#FFFFFF', height: '160vh', width: '70vh'}}
                            >
                                <div className={styles.formDiv}>
                                    <Avatar
                                        alt='Profile Image Preview'
                                        src={image}
                                        className={classes.avatarStyle}
                                        onClick={handleFileUploader}
                                    />
                                    <TextField
                                        id='first_name'
                                        label='First name'
                                        variant='outlined'
                                        size='small'
                                        error={errFirstName}
                                        onChange={checkValidationStrings}
                                    />
                                    <TextField
                                        id='last_name'
                                        label='Last name'
                                        variant='outlined'
                                        size='small'
                                        error={errLastName}
                                        onChange={checkValidationStrings}
                                    />
                                    <TextField
                                        id='email'
                                        label='E-mail'
                                        variant='outlined'
                                        size='small'
                                        error={errEmail}
                                        onChange={checkValidationEmail}
                                    />
                                    <TextField
                                        id='tel'
                                        label='tel'
                                        variant='outlined'
                                        size='small'
                                        error={errTel}
                                        onChange={checkValidationStrings}
                                    />
                                    <Autocomplete
                                        id='Country'
                                        onInputChange={fixCountry}
                                        style={{width: 222.667}}
                                        options={countryList}
                                        getOptionLabel={option => option.COUNTRY_NAME}
                                        renderInput={params => (
                                            <TextField
                                                {...params}
                                                label='Country'
                                                variant='outlined'
                                                margin='normal'
                                                size='small'
                                                onChange={handleCountry}
                                            />
                                        )}
                                        renderOption={(option, {inputValue}) => {
                                            const matches = match(option.COUNTRY_NAME, inputValue);
                                            const parts = parse(option.COUNTRY_NAME, matches);

                                            return (
                                                <div>
                                                    {parts.map((part, index) => (
                                                        <span
                                                            key={index}
                                                            style={{fontWeight: part.highlight ? 700 : 400}}
                                                        >
                                                            {part.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        }}
                                    />
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor='Position-native-helper'>Position</InputLabel>
                                        <NativeSelect
                                            native
                                            value={position}
                                            onChange={handlePositionChange}
                                            label='position'
                                            inputProps={{
                                                name: 'position',
                                                id: 'outlined-position-native-helper',
                                            }}
                                        >
                                            <option aria-label='None' value={-1} />
                                            <option value={0}>Owner</option>
                                            <option value={1}>Member</option>
                                        </NativeSelect>
                                        <FormHelperText>Select your job position</FormHelperText>
                                    </FormControl>
                                    {position === 0 ? (
                                        <TextField
                                            id='company_name'
                                            label='Company name'
                                            variant='outlined'
                                            size='small'
                                            error={errCompanyName}
                                            onChange={checkValidationStrings}
                                        />
                                    ) : (
                                        <Autocomplete
                                            id='Company'
                                            onInputChange={fixCompany}
                                            style={{width: 222.667}}
                                            options={companyList}
                                            getOptionLabel={option => option.COMPANY_NAME}
                                            renderInput={params => (
                                                <TextField
                                                    {...params}
                                                    label='Company'
                                                    variant='outlined'
                                                    margin='normal'
                                                    size='small'
                                                    error={errCompanyName}
                                                    onChange={handleChangeCompany}
                                                />
                                            )}
                                            renderOption={(option, {inputValue}) => {
                                                const matches = match(option.COMPANY_NAME, inputValue);
                                                const parts = parse(option.COMPANY_NAME, matches);

                                                return (
                                                    <div>
                                                        {parts.map((part, index) => (
                                                            <span
                                                                key={index}
                                                                style={{fontWeight: part.highlight ? 700 : 400}}
                                                            >
                                                                {part.text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                );
                                            }}
                                        />
                                    )}
                                    <Button variant='contained' color='primary' onClick={goToNextStep}>
                                        Next
                                    </Button>
                                </div>
                            </Typography>
                            <input
                                type='file'
                                name='file'
                                id='profileFile'
                                style={{display: 'none'}}
                                onChange={handleFileChange}
                            />
                        </Container>
                    </Grow>
                    {/* step 2 */}
                    <Grow in={step === 1}>
                        <Container maxWidth='sm' style={{display: step === 1 ? 'block' : 'none'}}>
                            <Typography
                                component='div'
                                style={{backgroundColor: '#FFFFFF', height: '85vh', width: '70vh'}}
                            >
                                <div className={styles.formDiv}>
                                    <Avatar
                                        alt='Profile Image Preview'
                                        src={image}
                                        className={classes.avatarStyle}
                                        onClick={handleFileUploader}
                                    />
                                    <TextField
                                        id='user_name'
                                        label='Nickname'
                                        variant='outlined'
                                        size='small'
                                        error={errNickname}
                                        onChange={checkValidationNickname}
                                    />
                                    <TextField
                                        type='password'
                                        id='password'
                                        label='Password'
                                        variant='outlined'
                                        error={errPw}
                                        size='small'
                                        onChange={checkValidationPw}
                                    />
                                    <TextField
                                        type='password'
                                        id='password_cf'
                                        label='Password Confirmation'
                                        variant='outlined'
                                        error={errPwCf}
                                        size='small'
                                        onChange={checkValidationPwCf}
                                    />
                                    <div className={styles.btnWrapper}>
                                        <Button variant='contained' color='secondary' onClick={goToPreviousStep}>
                                            previous
                                        </Button>
                                        <Button variant='contained' color='primary' onClick={handleSubmit}>
                                            sign-up
                                        </Button>
                                    </div>
                                </div>
                            </Typography>
                        </Container>
                    </Grow>
                </div>
            </div>
        </React.Fragment>
    );
}
