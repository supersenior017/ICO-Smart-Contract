import React, { useState, useEffect } from 'react';
import { AppBar, IconButton, Button, Container, Grid, Box, TextField, LinearProgress, Typography, linearProgressClasses, CircularProgress } from '@mui/material';
import { orange } from '@mui/material/colors';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import WalletIcon from '@mui/icons-material/Wallet';
import PropTypes from 'prop-types';
import './style.scss';



const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1976d2',
        },
    },
});

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 20,
    borderRadius: 10,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
    },
}));


const displayTime = () => {
    let now = new Date();
    let years = now.getFullYear();
    let months = now.getMonth() + 1;
    let days = now.getDate();
    let dateString = years + '/' + months + '/' + days;
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let timeString = hours + ':' + minutes + ':' + seconds;
    document.getElementById("date").innerHTML = dateString;
    document.getElementById("time").innerHTML = timeString;
};
const icostate = ['Deposit', 'Withdraw', 'Claim'];
const CircularProgressWithLabel = (props) => {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" size={100}
                sx={{
                    color: orange[200],
                    position: 'absolute',
                    top: -50,
                    left:-50
                }} {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                }}
            >
                <Typography variant="h4" component="div" color="text.secondary">
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}
CircularProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired
}
const Initialco = () => {

    const [softCap, setsoftCap] = useState(100);
    const [hardCap, sethardCap] = useState(1000);
    const [amount, setamount] = useState(10);
    const [bstate, setbstate] = useState(icostate[0]);
    const [spent, setspent] = useState(20);
    const [ainput, setainput]= useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setspent((prevProgress) =>
                prevProgress >= 100 ? 10 : prevProgress + 1 /8640
            );
            displayTime();
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);


    const Deposite=()=>{
        const newValue=amount+ainput;
        setamount(newValue);
    }
    const onChange=(event)=>{
        const newValue=event.target.value*1;
        setainput(newValue);
    }
    return (
        <div>
            <ThemeProvider theme={darkTheme}>
            <Grid container>
                <Grid xs={12}>
                    <AppBar position="static" className='header' title="Smart Contract">Smart Contract
                    </AppBar>
                </Grid>
                <Grid xs={7}>
                    <span id='date'></span>
                    <span id='time'></span>
                </Grid>
                <Grid xs={5}>
                    <Button secondary color="success" id="connect-button" > <WalletIcon />  Wallet Connect</Button>
                </Grid>
            </Grid>
            <Container >
                <Box sx={{
                    border: '1px solid gray',
                    borderRadius: '5px',
                    paddingTop:"3%",
                    paddingBottom:'5%',
                    marginTop:"10%"
                    
                }}>
                    <Grid container >
                        <Grid xs={3}>
                            <div style={{ padding: '5%' }}>
                                <TextField
                                    id="outlined-number"
                                    label="Deposit Amount"
                                    type="number"

                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onChange={(event)=>onChange(event)}
                                /></div>
                        </Grid>
                        <Grid xs={2}>
                            <div className='description'>Total Deposit: {<span style={{ fontWeight: 700, fontSize: '18pt' }}>{amount}</span>}</div>
                        </Grid>
                        <Grid xs={5}></Grid>
                        <Grid xs={2}>
                            <div style={{ padding: "10%" }}><Button variant="outlined" onClick={Deposite}>{bstate}</Button></div>
                        </Grid>
                        <Grid xs={1}>
                            <p style={{ fontSize: '18pt' }}>0</p>
                        </Grid>
                        <Grid xs={10} style={{ paddingTop: '1%' }}>
                            <BorderLinearProgress variant="determinate" value={softCap / 10} />
                            <Typography variant="h3" component="div" si color="green">
                                {`${Math.round((softCap / hardCap) * 100)}%`}
                            </Typography>
                        </Grid>
                        <Grid xs={1}>
                            <p style={{ fontSize: '18pt' }}>{hardCap}</p>
                        </Grid>
                        <Grid xs={2}></Grid>
                        <Grid xs={1} style={{ paddingTop: '1%' }} rowSpacing={8}>
                            <CircularProgressWithLabel value={spent} />
                        </Grid>
                        <Grid xs={7}>
                            <span style={{fontSize:"18pt", }}>ICO period: 5/8/2023 0 AM GMT - 5/9/2023 0 AM GMT</span>
                        </Grid>
                    </Grid>


                </Box>
            </Container>
            </ThemeProvider>
        </div >


    )

}
export default Initialco;