# CALENZO Backend Server (PowerShell .NET HttpListener)
# Clinic Appointment & Queue Management System API & Static Server

param(
    [int]$Port = 5000
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$BasePath = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $BasePath) { $BasePath = "D:\system" }
$PublicDir = Join-Path $BasePath "public"
$DataDir = Join-Path $BasePath "data"

function Get-JsonFile {
    param([string]$Filename)
    $filePath = Join-Path $DataDir $Filename
    if (Test-Path $filePath) {
        $raw = Get-Content -Path $filePath -Raw -Encoding UTF8
        if ($raw) {
            $parsed = $raw | ConvertFrom-Json
            if ($parsed -is [System.Collections.IList] -or $parsed -is [Array]) {
                return @($parsed)
            } else {
                return $parsed
            }
        }
    }
    return @()
}

function Save-JsonFile {
    param([string]$Filename, $Data)
    $filePath = Join-Path $DataDir $Filename
    $json = $Data | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($filePath, $json, [System.Text.Encoding]::UTF8)
}

function Send-Response {
    param(
        $Response,
        [int]$StatusCode = 200,
        [string]$ContentType = "application/json; charset=utf-8",
        $Body
    )
    try {
        $Response.StatusCode = $StatusCode
        $Response.ContentType = $ContentType
        $Response.AddHeader("Access-Control-Allow-Origin", "*")
        $Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        $Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
        $Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")

        if ($Body -is [string]) {
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($Body)
        } elseif ($Body -is [byte[]]) {
            $buffer = $Body
        } else {
            $json = $Body | ConvertTo-Json -Depth 10
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
        }

        $Response.ContentLength64 = $buffer.Length
        $Response.OutputStream.Write($buffer, 0, $buffer.Length)
    } finally {
        try { $Response.OutputStream.Close() } catch {}
    }
}

function Get-MimeType {
    param([string]$ext)
    switch ($ext.ToLower()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".svg"  { return "image/svg+xml" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".ico"  { return "image/x-icon" }
        default { return "application/octet-stream" }
    }
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:${Port}/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " CALENZO - Clinic Appointment & Queue Management System   " -ForegroundColor Green
    Write-Host " Server running at: http://localhost:${Port}/              " -ForegroundColor Yellow
    Write-Host " Web root: $PublicDir                                      " -ForegroundColor Gray
    Write-Host " Press Ctrl+C in this console to stop the server          " -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
} catch {
    Write-Error "Failed to start listener on port ${Port}: $_"
    exit 1
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
    } catch {
        break
    }

    $request = $context.Request
    $response = $context.Response

    try {
        $urlPath = $request.Url.AbsolutePath
        $method = $request.HttpMethod

        # CORS Preflight
        if ($method -eq "OPTIONS") {
            Send-Response -Response $response -StatusCode 204 -Body ""
            continue
        }

        # Request Body
        $bodyJson = $null
        if ($method -eq "POST" -or $method -eq "PUT") {
            if ($request.HasEntityBody) {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $bodyStr = $reader.ReadToEnd()
                if ($bodyStr) {
                    try {
                        $bodyJson = $bodyStr | ConvertFrom-Json
                    } catch {
                        $bodyJson = $bodyStr
                    }
                }
            }
        }

        # GET /api/clinic
        if ($urlPath -eq "/api/clinic" -and $method -eq "GET") {
            $clinic = Get-JsonFile "clinic.json"
            Send-Response -Response $response -Body $clinic
            continue
        }

        # POST /api/clinic
        if ($urlPath -eq "/api/clinic" -and $method -eq "POST") {
            Save-JsonFile "clinic.json" $bodyJson
            Send-Response -Response $response -Body @{ success = $true; message = "Clinic settings updated"; clinic = $bodyJson }
            continue
        }

        # GET /api/patients
        if ($urlPath -eq "/api/patients" -and $method -eq "GET") {
            $patients = Get-JsonFile "patients.json"
            $query = $request.QueryString["q"]
            if ($query) {
                $qLower = $query.ToLower()
                $filtered = @()
                foreach ($p in $patients) {
                    $match = $false
                    if ($p.name -and $p.name.ToString().ToLower().Contains($qLower)) { $match = $true }
                    if ($p.phone -and $p.phone.ToString().Contains($query)) { $match = $true }
                    if ($p.id -and $p.id.ToString().ToLower().Contains($qLower)) { $match = $true }
                    if ($match) { $filtered += $p }
                }
                Send-Response -Response $response -Body $filtered
            } else {
                Send-Response -Response $response -Body $patients
            }
            continue
        }

        # POST /api/patients
        if ($urlPath -eq "/api/patients" -and $method -eq "POST") {
            $patients = @(Get-JsonFile "patients.json")
            $patient = $bodyJson
            if (-not $patient.id) {
                $patient.id = "P-" + ((Get-Random -Minimum 100 -Maximum 999).ToString())
                $patient.totalVisits = 1
                $patient.noShowCount = 0
                $patients = $patients + @($patient)
            } else {
                $idx = -1
                for ($i=0; $i -lt $patients.Count; $i++) {
                    if ($patients[$i].id -eq $patient.id) { $idx = $i; break }
                }
                if ($idx -ge 0) {
                    $patients[$idx] = $patient
                } else {
                    $patients = $patients + @($patient)
                }
            }
            Save-JsonFile "patients.json" $patients
            Send-Response -Response $response -Body @{ success = $true; patient = $patient }
            continue
        }

        # GET /api/appointments
        if ($urlPath -eq "/api/appointments" -and $method -eq "GET") {
            $appointments = Get-JsonFile "appointments.json"
            $dateFilter = $request.QueryString["date"]
            if ($dateFilter) {
                $filtered = @()
                foreach ($a in $appointments) {
                    if ($a.date -eq $dateFilter) { $filtered += $a }
                }
                Send-Response -Response $response -Body $filtered
            } else {
                Send-Response -Response $response -Body $appointments
            }
            continue
        }

        # POST /api/appointments/book
        if ($urlPath -eq "/api/appointments/book" -and $method -eq "POST") {
            $appointments = @(Get-JsonFile "appointments.json")
            $clinic = Get-JsonFile "clinic.json"
            $patients = @(Get-JsonFile "patients.json")
            $notifications = @(Get-JsonFile "notifications.json")

            $reqDate = (Get-Date).ToString("yyyy-MM-dd")
            if ($bodyJson.date) { $reqDate = $bodyJson.date }
            
            $patientPhone = $bodyJson.phone
            $foundPatient = $null
            foreach ($p in $patients) {
                if ($p.phone -eq $patientPhone) {
                    $foundPatient = $p
                    break
                }
            }

            if (-not $foundPatient) {
                $newPid = "P-" + ((Get-Random -Minimum 200 -Maximum 999).ToString())
                $pAge = 30
                if ($bodyJson.age) { $pAge = [int]$bodyJson.age }
                $pGender = "Other"
                if ($bodyJson.gender) { $pGender = $bodyJson.gender }
                $pEmail = ""
                if ($bodyJson.email) { $pEmail = $bodyJson.email }
                $pAddress = "Local"
                if ($bodyJson.address) { $pAddress = $bodyJson.address }
                $pEmergency = ""
                if ($bodyJson.emergencyContact) { $pEmergency = $bodyJson.emergencyContact }
                $pHistory = "First visit."
                if ($bodyJson.notes) { $pHistory = $bodyJson.notes }
                $pSource = "online"
                if ($bodyJson.source) { $pSource = $bodyJson.source }

                $foundPatient = [pscustomobject]@{
                    id = $newPid
                    name = $bodyJson.name
                    age = $pAge
                    gender = $pGender
                    phone = $patientPhone
                    email = $pEmail
                    address = $pAddress
                    emergencyContact = $pEmergency
                    totalVisits = 1
                    lastVisitDate = $reqDate
                    noShowCount = 0
                    medicalHistory = $pHistory
                    allergies = "None reported"
                    internalNotes = "Booked via $pSource"
                }
                $patients = $patients + @($foundPatient)
            } else {
                $foundPatient.totalVisits = [int]$foundPatient.totalVisits + 1
                $foundPatient.lastVisitDate = $reqDate
            }
            Save-JsonFile "patients.json" $patients

            $dateAppts = @()
            foreach ($a in $appointments) {
                if ($a.date -eq $reqDate) { $dateAppts += $a }
            }
            $nextTokenNum = $dateAppts.Count + 1
            $tokenStr = "A-" + ($nextTokenNum.ToString("00"))

            $consultType = "new"
            if ($bodyJson.type) { $consultType = $bodyJson.type }

            $estDuration = 20
            if ($consultType -eq "follow_up") { $estDuration = 10 }
            elseif ($consultType -eq "procedure") { $estDuration = 30 }

            $timeSlot = (Get-Date).ToString("hh:mm tt")
            if ($bodyJson.timeSlot) { $timeSlot = $bodyJson.timeSlot }

            $suggestedArrival = "10 mins before $timeSlot"

            $svcName = "General Physician Consultation"
            if ($bodyJson.serviceName) { $svcName = $bodyJson.serviceName }

            $src = "online"
            if ($bodyJson.source) { $src = $bodyJson.source }

            $fDays = 7
            if ($consultType -eq "follow_up") { $fDays = 30 }

            $newApt = [pscustomobject]@{
                id = "APT-" + ($reqDate.Replace("-","")) + "-" + ($nextTokenNum.ToString("000"))
                tokenNumber = $tokenStr
                date = $reqDate
                timeSlot = $timeSlot
                patientId = $foundPatient.id
                patientName = $foundPatient.name
                patientPhone = $foundPatient.phone
                patientAge = $foundPatient.age
                patientGender = $foundPatient.gender
                type = $consultType
                serviceName = $svcName
                source = $src
                status = "waiting"
                estimatedDuration = $estDuration
                actualDuration = $null
                suggestedArrivalWindow = $suggestedArrival
                startedAt = $null
                completedAt = $null
                queuePosition = $dateAppts.Count
                doctorNotes = ""
                diagnosis = ""
                prescriptionSummary = ""
                followUpRecommendedDays = $fDays
            }
            $appointments = $appointments + @($newApt)
            Save-JsonFile "appointments.json" $appointments

            $msgContent = "Namaste $($foundPatient.name) ji. Your appointment at $($clinic.clinicName) is CONFIRMED with $($clinic.doctorName) for $reqDate at $timeSlot. Token: *$tokenStr*. Suggested Arrival: $suggestedArrival. Track live queue before leaving home: http://localhost:5000/?token=$tokenStr"
            $notif = [pscustomobject]@{
                id = "MSG-" + (Get-Date).Ticks.ToString().Substring(10)
                timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                recipientPhone = $foundPatient.phone
                recipientName = $foundPatient.name
                type = "booking_confirmation"
                channel = "WhatsApp"
                status = "Delivered"
                message = $msgContent
            }
            $notifications = @($notif) + $notifications
            Save-JsonFile "notifications.json" $notifications

            Send-Response -Response $response -Body @{
                success = $true
                appointment = $newApt
                notification = $notif
                tokenNumber = $tokenStr
            }
            continue
        }

        # POST /api/queue/action
        if ($urlPath -eq "/api/queue/action" -and $method -eq "POST") {
            $appointments = @(Get-JsonFile "appointments.json")
            $notifications = @(Get-JsonFile "notifications.json")
            $followups = @(Get-JsonFile "followups.json")
            $clinic = Get-JsonFile "clinic.json"

            $action = $bodyJson.action
            $aptId = $bodyJson.appointmentId
            $foundApt = $null
            $aptIdx = -1

            for ($i=0; $i -lt $appointments.Count; $i++) {
                if ($appointments[$i].id -eq $aptId -or $appointments[$i].tokenNumber -eq $aptId) {
                    $foundApt = $appointments[$i]
                    $aptIdx = $i
                    break
                }
            }

            if (-not $foundApt -and $action -ne "delay") {
                Send-Response -Response $response -StatusCode 404 -Body @{ error = "Appointment not found" }
                continue
            }

            $nowTime = (Get-Date).ToString("hh:mm tt")

            switch ($action) {
                "arrived" {
                    $foundApt.status = "arrived"
                }
                "start" {
                    # If another was in consultation, mark completed
                    for ($k=0; $k -lt $appointments.Count; $k++) {
                        if ($appointments[$k].status -eq "in_consultation" -and $appointments[$k].id -ne $foundApt.id) {
                            $appointments[$k].status = "completed"
                            $appointments[$k].completedAt = $nowTime
                        }
                    }
                    $foundApt.status = "in_consultation"
                    $foundApt.startedAt = $nowTime
                }
                "complete" {
                    $foundApt.status = "completed"
                    $foundApt.completedAt = $nowTime
                    $actDur = [int]$foundApt.estimatedDuration
                    if ($bodyJson.actualDuration) { $actDur = [int]$bodyJson.actualDuration }
                    $foundApt.actualDuration = $actDur

                    if ($bodyJson.doctorNotes) { $foundApt.doctorNotes = $bodyJson.doctorNotes }
                    if ($bodyJson.diagnosis) { $foundApt.diagnosis = $bodyJson.diagnosis }
                    if ($bodyJson.prescriptionSummary) { $foundApt.prescriptionSummary = $bodyJson.prescriptionSummary }

                    # Auto-create follow-up task
                    $followDays = 7
                    if ($bodyJson.followUpRecommendedDays) { $followDays = [int]$bodyJson.followUpRecommendedDays }
                    $dueDate = (Get-Date).AddDays($followDays).ToString("yyyy-MM-dd")
                    $priority = "Warm"
                    if ($followDays -le 7) { $priority = "Hot" }
                    elseif ($followDays -gt 30) { $priority = "Cold" }

                    $newFu = [pscustomobject]@{
                        id = "FU-" + ((Get-Random -Minimum 300 -Maximum 999).ToString())
                        appointmentId = $foundApt.id
                        patientId = $foundApt.patientId
                        patientName = $foundApt.patientName
                        phone = $foundApt.patientPhone
                        priority = $priority
                        dueDate = $dueDate
                        reason = "Follow-up consultation after " + $foundApt.serviceName
                        status = "Pending"
                        notes = "Auto-generated upon completion of token " + $foundApt.tokenNumber
                        createdAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                        lastContactedAt = $null
                    }
                    $followups = @($newFu) + $followups
                    Save-JsonFile "followups.json" $followups
                }
                "skip" {
                    $foundApt.status = "skipped"
                }
                "recall" {
                    $foundApt.status = "arrived"
                }
                "cancel" {
                    $foundApt.status = "cancelled"
                    $notifMsg = "Notice: Slot updated. Token $($foundApt.tokenNumber) was cancelled. All subsequent queue timings have been adjusted forward by ~$($foundApt.estimatedDuration) mins."
                    $notif = [pscustomobject]@{
                        id = "MSG-" + (Get-Date).Ticks.ToString().Substring(10)
                        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                        recipientPhone = "+91 Broadcast"
                        recipientName = "Downstream Patients"
                        type = "empty_slot_alert"
                        channel = "WhatsApp"
                        status = "Delivered"
                        message = $notifMsg
                    }
                    $notifications = @($notif) + $notifications
                }
                "delay" {
                    $delayMins = [int]$bodyJson.delayMinutes
                    $clinic.currentDelayMinutes = [int]$clinic.currentDelayMinutes + $delayMins
                    $clinic.lastDelayBroadcast = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                    Save-JsonFile "clinic.json" $clinic

                    $delayNotice = "Urgent Clinic Update from $($clinic.clinicName): Dr. is currently running approximately $delayMins minutes behind schedule due to an emergency case. Your queue position is retained and arrival window is adjusted. Live tracker: http://localhost:5000/"
                    $notif = [pscustomobject]@{
                        id = "MSG-" + (Get-Date).Ticks.ToString().Substring(10)
                        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                        recipientPhone = "All Waiting Patients"
                        recipientName = "Queue Broadcast"
                        type = "delay_notice"
                        channel = "WhatsApp"
                        status = "Delivered"
                        message = $delayNotice
                    }
                    $notifications = @($notif) + $notifications
                }
            }

            if ($aptIdx -ge 0) {
                $appointments[$aptIdx] = $foundApt
            }
            Save-JsonFile "appointments.json" $appointments
            Save-JsonFile "notifications.json" $notifications

            Send-Response -Response $response -Body @{
                success = $true
                action = $action
                appointment = $foundApt
                clinicDelay = $clinic.currentDelayMinutes
            }
            continue
        }

        # POST /api/appointments/emergency-cancel
        if ($urlPath -eq "/api/appointments/emergency-cancel" -and $method -eq "POST") {
            $appointments = @(Get-JsonFile "appointments.json")
            $notifications = @(Get-JsonFile "notifications.json")
            $clinic = Get-JsonFile "clinic.json"

            $aptId = $bodyJson.appointmentId
            $reason = $bodyJson.reason
            $resolution = $bodyJson.resolution

            $targetApt = $null
            $targetIdx = -1
            for ($i=0; $i -lt $appointments.Count; $i++) {
                if ($appointments[$i].id -eq $aptId -or $appointments[$i].tokenNumber -eq $aptId) {
                    $targetApt = $appointments[$i]
                    $targetIdx = $i
                    break
                }
            }

            if (-not $targetApt) {
                Send-Response -Response $response -StatusCode 404 -Body @{ error = "Appointment not found" }
                continue
            }

            $targetApt.status = "cancelled"
            $targetApt | Add-Member -NotePropertyName "cancellationReason" -NotePropertyValue $reason -Force
            $refundTxt = "Rescheduled to Next Business Day"
            if ($resolution -eq "refund_50") {
                $refundTxt = "50% Refund Initiated to Original Payment Source"
            }
            $targetApt | Add-Member -NotePropertyName "refundStatus" -NotePropertyValue $refundTxt -Force

            $appointments[$targetIdx] = $targetApt

            $notif = [pscustomobject]@{
                id = "MSG-" + (Get-Date).Ticks.ToString().Substring(10)
                timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                recipientPhone = $targetApt.patientPhone
                recipientName = $targetApt.patientName
                type = "cancellation_notice"
                channel = "WhatsApp"
                status = "Delivered"
                message = "Namaste $($targetApt.patientName) ji. Cancellation processed for token $($targetApt.tokenNumber). Resolution: $($targetApt.refundStatus). Thank you for informing $($clinic.clinicName)."
            }
            $notifications = @($notif) + $notifications

            Save-JsonFile "appointments.json" $appointments
            Save-JsonFile "notifications.json" $notifications

            Send-Response -Response $response -Body @{
                success = $true
                resolution = $targetApt.refundStatus
                adjustedMinutesSaved = $targetApt.estimatedDuration
                message = "Emergency cancellation recorded. Downstream wait times shifted earlier."
            }
            continue
        }

        # GET /api/followups
        if ($urlPath -eq "/api/followups" -and $method -eq "GET") {
            $followups = Get-JsonFile "followups.json"
            Send-Response -Response $response -Body $followups
            continue
        }

        # POST /api/followups/action
        if ($urlPath -eq "/api/followups/action" -and $method -eq "POST") {
            $followups = @(Get-JsonFile "followups.json")
            $notifications = @(Get-JsonFile "notifications.json")
            $clinic = Get-JsonFile "clinic.json"
            $fuId = $bodyJson.id
            $action = $bodyJson.action

            $idx = -1
            for ($i=0; $i -lt $followups.Count; $i++) {
                if ($followups[$i].id -eq $fuId) { $idx = $i; break }
            }

            if ($idx -ge 0) {
                if ($action -eq "contacted") {
                    $followups[$idx].status = "Contacted"
                    $followups[$idx].lastContactedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")

                    $remindMsg = "Namaste $($followups[$idx].patientName) ji. This is a gentle follow-up reminder from $($clinic.clinicName). Your scheduled follow-up is due on $($followups[$idx].dueDate) ($($followups[$idx].reason)). To book your preferred slot directly: http://localhost:5000/"
                    $notif = [pscustomobject]@{
                        id = "MSG-" + (Get-Date).Ticks.ToString().Substring(10)
                        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                        recipientPhone = $followups[$idx].phone
                        recipientName = $followups[$idx].patientName
                        type = "follow_up_reminder"
                        channel = "WhatsApp"
                        status = "Delivered"
                        message = $remindMsg
                    }
                    $notifications = @($notif) + $notifications
                    Save-JsonFile "notifications.json" $notifications
                } elseif ($action -eq "completed") {
                    $followups[$idx].status = "Completed"
                } elseif ($action -eq "rescheduled") {
                    $followups[$idx].status = "Rescheduled"
                    if ($bodyJson.newDate) { $followups[$idx].dueDate = $bodyJson.newDate }
                }
                Save-JsonFile "followups.json" $followups
                Send-Response -Response $response -Body @{ success = $true; followUp = $followups[$idx] }
            } else {
                Send-Response -Response $response -StatusCode 404 -Body @{ error = "Follow-up not found" }
            }
            continue
        }

        # GET /api/notifications
        if ($urlPath -eq "/api/notifications" -and $method -eq "GET") {
            $notifications = Get-JsonFile "notifications.json"
            Send-Response -Response $response -Body $notifications
            continue
        }

        # POST /api/notifications/send
        if ($urlPath -eq "/api/notifications/send" -and $method -eq "POST") {
            $notifications = @(Get-JsonFile "notifications.json")
            $notifType = "custom_message"
            if ($bodyJson.type) { $notifType = $bodyJson.type }

            $notif = [pscustomobject]@{
                id = "MSG-" + (Get-Date).Ticks.ToString().Substring(10)
                timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                recipientPhone = $bodyJson.recipientPhone
                recipientName = $bodyJson.recipientName
                type = $notifType
                channel = "WhatsApp"
                status = "Delivered"
                message = $bodyJson.message
            }
            $notifications = @($notif) + $notifications
            Save-JsonFile "notifications.json" $notifications
            Send-Response -Response $response -Body @{ success = $true; notification = $notif }
            continue
        }

        # GET /api/queue/live
        if ($urlPath -eq "/api/queue/live" -and $method -eq "GET") {
            $appointments = Get-JsonFile "appointments.json"
            $clinic = Get-JsonFile "clinic.json"

            $todayStr = (Get-Date).ToString("yyyy-MM-dd")
            if ($request.QueryString["date"]) { $todayStr = $request.QueryString["date"] }
            
            $currentInConsultation = $null
            $waitingQueue = @()
            $arrivedQueue = @()
            $skippedQueue = @()
            $completedQueue = @()

            $todayAppts = @()
            foreach ($a in $appointments) {
                if ($a.date -eq $todayStr) {
                    $todayAppts += $a
                }
            }

            foreach ($a in $todayAppts) {
                if ($a.status -eq "in_consultation") {
                    $currentInConsultation = $a
                } elseif ($a.status -eq "arrived") {
                    $arrivedQueue += $a
                } elseif ($a.status -eq "waiting") {
                    $waitingQueue += $a
                } elseif ($a.status -eq "skipped") {
                    $skippedQueue += $a
                } elseif ($a.status -eq "completed") {
                    $completedQueue += $a
                }
            }

            $activeInLine = @()
            $cumulativeWait = [int]$clinic.currentDelayMinutes
            if ($currentInConsultation) {
                $cumulativeWait += 10
            }

            $order = 1
            foreach ($a in ($arrivedQueue + $waitingQueue)) {
                $itemObj = [pscustomobject]@{
                    id = $a.id
                    tokenNumber = $a.tokenNumber
                    date = $a.date
                    timeSlot = $a.timeSlot
                    patientId = $a.patientId
                    patientName = $a.patientName
                    patientPhone = $a.patientPhone
                    patientAge = $a.patientAge
                    patientGender = $a.patientGender
                    type = $a.type
                    serviceName = $a.serviceName
                    source = $a.source
                    status = $a.status
                    estimatedDuration = $a.estimatedDuration
                    suggestedArrivalWindow = $a.suggestedArrivalWindow
                    queuePosition = $order
                    dynamicWaitMinutes = $cumulativeWait
                }
                $activeInLine += $itemObj
                $cumulativeWait += [int]$a.estimatedDuration
                $order++
            }

            Send-Response -Response $response -Body @{
                clinicName = $clinic.clinicName
                doctorName = $clinic.doctorName
                currentDelayMinutes = $clinic.currentDelayMinutes
                currentInConsultation = $currentInConsultation
                activeQueue = $activeInLine
                arrivedCount = $arrivedQueue.Count
                waitingCount = $waitingQueue.Count
                skippedQueue = $skippedQueue
                completedCount = $completedQueue.Count
                totalToday = $todayAppts.Count
            }
            continue
        }

        # GET /api/analytics
        if ($urlPath -eq "/api/analytics" -and $method -eq "GET") {
            $appointments = Get-JsonFile "appointments.json"
            $patients = Get-JsonFile "patients.json"

            $total = $appointments.Count
            $completed = 0
            $noShows = 0
            $online = 0
            $walkIn = 0
            $totalWaitMins = 0
            $totalConsultMins = 0
            $consultCount = 0

            foreach ($a in $appointments) {
                if ($a.status -eq "completed") {
                    $completed++
                    if ($a.actualDuration) {
                        $totalConsultMins += [int]$a.actualDuration
                        $consultCount++
                    }
                } elseif ($a.status -eq "no_show") {
                    $noShows++
                }
                if ($a.source -eq "online") { $online++ } else { $walkIn++ }
            }

            $noShowRate = 0
            if ($total -gt 0) { $noShowRate = [math]::Round(($noShows / $total) * 100, 1) }

            $avgConsultWait = 18
            if ($consultCount -gt 0) { $avgConsultWait = [math]::Round($totalConsultMins / $consultCount, 0) }

            $newCount = 0
            $returningCount = 0
            foreach ($a in $appointments) {
                if ($a.type -eq "new") { $newCount++ } else { $returningCount++ }
            }

            $result = @{
                totals = @{
                    totalAppointments = $total
                    completed = $completed
                    noShows = $noShows
                    onlineBookings = $online
                    walkIns = $walkIn
                    registeredPatients = $patients.Count
                }
                noShowRate = $noShowRate
                sourceBreakdown = @{
                    online = $online
                    walkIn = $walkIn
                }
                durations = @{
                    avgConsultMinutes = $avgConsultWait
                    avgWaitMinutes = 14
                }
                patientRatio = @{
                    newPatients = $newCount
                    returningPatients = $returningCount
                }
                hourlyDistribution = @(
                    @{ hour = "09:00 AM"; count = 4; status = "Peak" },
                    @{ hour = "10:00 AM"; count = 5; status = "Busiest" },
                    @{ hour = "11:00 AM"; count = 3; status = "Moderate" },
                    @{ hour = "12:00 PM"; count = 2; status = "Moderate" },
                    @{ hour = "02:30 PM"; count = 4; status = "Peak" },
                    @{ hour = "04:00 PM"; count = 3; status = "Moderate" }
                )
            }
            Send-Response -Response $response -Body $result
            continue
        }

        # STATIC FILES
        $localPath = $urlPath
        if ($localPath -eq "/" -or $localPath -eq "") {
            $localPath = "/index.html"
        }
        $localPath = $localPath.TrimStart('/').Replace('/', '\')
        $fullFilePath = Join-Path $PublicDir $localPath

        if (Test-Path $fullFilePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullFilePath)
            $mime = Get-MimeType $ext
            $bytes = [System.IO.File]::ReadAllBytes($fullFilePath)
            Send-Response -Response $response -StatusCode 200 -ContentType $mime -Body $bytes
        } else {
            $indexHtml = Join-Path $PublicDir "index.html"
            if (Test-Path $indexHtml -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($indexHtml)
                Send-Response -Response $response -StatusCode 200 -ContentType "text/html; charset=utf-8" -Body $bytes
            } else {
                Send-Response -Response $response -StatusCode 404 -Body @{ error = "File not found: $urlPath" }
            }
        }
    } catch {
        Write-Warning "Error processing request: $_"
        try {
            Send-Response -Response $response -StatusCode 500 -Body @{ error = $_.ToString() }
        } catch {}
    }
}
