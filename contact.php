<?php

declare(strict_types=1);



header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');



function vpn_json_response(int $status, array $payload): void
{
    http_response_code($status);

    echo json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

function vpn_string_length(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    return strlen($value);
}

function vpn_string_slice(string $value, int $length): string
{
    if (function_exists('mb_substr')) {
        return mb_substr(
            $value,
            0,
            $length,
            'UTF-8'
        );
    }

    return substr($value, 0, $length);
}

function vpn_has_header_injection(string $value): bool
{
    return preg_match('/[\r\n]/', $value) === 1;
}

function vpn_clean_single_line(
    $value,
    int $maxLength
): string {
    if (!is_string($value)) {
        return '';
    }

    $value = trim($value);

    $value = strip_tags($value);

    $value = preg_replace(
        '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u',
        '',
        $value
    ) ?? '';

    $value = preg_replace(
        '/[ \t]+/u',
        ' ',
        $value
    ) ?? '';

    if (
        vpn_string_length($value) >
        $maxLength
    ) {
        $value = vpn_string_slice(
            $value,
            $maxLength
        );
    }

    return trim($value);
}

function vpn_clean_multiline(
    $value,
    int $maxLength
): string {
    if (!is_string($value)) {
        return '';
    }

    $value = trim($value);

    $value = strip_tags($value);

    $value = str_replace(
        ["\r\n", "\r"],
        "\n",
        $value
    );

    $value = preg_replace(
        '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u',
        '',
        $value
    ) ?? '';

    $value = preg_replace(
        "/[ \t]+\n/u",
        "\n",
        $value
    ) ?? '';

    $value = preg_replace(
        "/\n{4,}/u",
        "\n\n\n",
        $value
    ) ?? '';

    if (
        vpn_string_length($value) >
        $maxLength
    ) {
        $value = vpn_string_slice(
            $value,
            $maxLength
        );
    }

    return trim($value);
}

function vpn_config_value(
    array $config,
    string $path,
    $fallback = null
) {
    $segments = explode('.', $path);
    $current = $config;

    foreach ($segments as $segment) {
        if (
            !is_array($current) ||
            !array_key_exists(
                $segment,
                $current
            )
        ) {
            return $fallback;
        }

        $current = $current[$segment];
    }

    return $current;
}

function vpn_load_site_config(
    string $configPath
): array {
    if (!is_file($configPath)) {
        vpn_json_response(
            500,
            [
                'success' => false,
                'message' =>
                    'The website configuration could not be loaded.'
            ]
        );
    }

    $source = file_get_contents(
        $configPath
    );

    if ($source === false) {
        vpn_json_response(
            500,
            [
                'success' => false,
                'message' =>
                    'The website configuration could not be read.'
            ]
        );
    }

    $source = preg_replace(
        '/^\xEF\xBB\xBF/',
        '',
        $source
    ) ?? $source;

    $source = trim($source);

    $matched = preg_match(
        '/window\.SITE_CONFIG\s*=\s*(\{.*\})\s*;\s*$/s',
        $source,
        $matches
    );

    if (
        $matched !== 1 ||
        !isset($matches[1])
    ) {
        vpn_json_response(
            500,
            [
                'success' => false,
                'message' =>
                    'The website configuration format is invalid.'
            ]
        );
    }

    $config = json_decode(
        $matches[1],
        true
    );

    if (
        !is_array($config) ||
        json_last_error() !== JSON_ERROR_NONE
    ) {
        vpn_json_response(
            500,
            [
                'success' => false,
                'message' =>
                    'The website configuration contains invalid JSON.'
            ]
        );
    }

    return $config;
}

function vpn_encode_mail_name(
    string $value
): string {
    if (
        function_exists(
            'mb_encode_mimeheader'
        )
    ) {
        return mb_encode_mimeheader(
            $value,
            'UTF-8',
            'B',
            "\r\n"
        );
    }

    return $value;
}

function vpn_field_line(
    string $label,
    string $value
): string {
    if ($value === '') {
        return '';
    }

    return $label . ': ' . $value . "\n";
}



$requestMethod =
    $_SERVER['REQUEST_METHOD'] ?? '';

if ($requestMethod !== 'POST') {
    header('Allow: POST');

    vpn_json_response(
        405,
        [
            'success' => false,
            'message' =>
                'Only POST requests are accepted.'
        ]
    );
}



$contentLength = isset(
    $_SERVER['CONTENT_LENGTH']
)
    ? (int) $_SERVER['CONTENT_LENGTH']
    : 0;

if ($contentLength > 100000) {
    vpn_json_response(
        413,
        [
            'success' => false,
            'message' =>
                'The submitted request is too large.'
        ]
    );
}



$configPath =
    __DIR__ .
    DIRECTORY_SEPARATOR .
    'config' .
    DIRECTORY_SEPARATOR .
    'config.js';

$config = vpn_load_site_config(
    $configPath
);



$recipientEmail =
    vpn_clean_single_line(
        vpn_config_value(
            $config,
            'contact.corporateEmail',
            ''
        ),
        190
    );

$siteName =
    vpn_clean_single_line(
        vpn_config_value(
            $config,
            'brand.siteName',
            'OrbitLock VPN'
        ),
        120
    );

$companyName =
    vpn_clean_single_line(
        vpn_config_value(
            $config,
            'brand.companyName',
            $siteName
        ),
        160
    );

$successMessage =
    vpn_clean_single_line(
        vpn_config_value(
            $config,
            'forms.successMessage',
            'Thank you! We have successfully received your request. Our team will review your information and get back to you shortly.'
        ),
        500
    );

$errorMessage =
    vpn_clean_single_line(
        vpn_config_value(
            $config,
            'forms.errorMessage',
            'We could not send your request. Please check the information and try again.'
        ),
        500
    );

if (
    $recipientEmail === '' ||
    !filter_var(
        $recipientEmail,
        FILTER_VALIDATE_EMAIL
    ) ||
    vpn_has_header_injection(
        $recipientEmail
    )
) {
    vpn_json_response(
        500,
        [
            'success' => false,
            'message' =>
                'The corporate email in the website configuration is invalid.'
        ]
    );
}



$honeypot = vpn_clean_single_line(
    $_POST['website'] ?? '',
    200
);

if ($honeypot !== '') {
    vpn_json_response(
        400,
        [
            'success' => false,
            'message' =>
                'The request could not be processed.'
        ]
    );
}



$rawFullName =
    is_string(
        $_POST['fullName'] ?? null
    )
        ? $_POST['fullName']
        : '';

$rawEmail =
    is_string(
        $_POST['email'] ?? null
    )
        ? $_POST['email']
        : '';

$rawCompany =
    is_string(
        $_POST['company'] ?? null
    )
        ? $_POST['company']
        : '';

$rawInquiryType =
    is_string(
        $_POST['inquiryType'] ?? null
    )
        ? $_POST['inquiryType']
        : '';

$rawProjectGoal =
    is_string(
        $_POST['projectGoal'] ?? null
    )
        ? $_POST['projectGoal']
        : '';

$rawBudgetRange =
    is_string(
        $_POST['budgetRange'] ?? null
    )
        ? $_POST['budgetRange']
        : '';

$rawPrimaryDevice =
    is_string(
        $_POST['primaryDevice'] ?? null
    )
        ? $_POST['primaryDevice']
        : '';

$rawMainUseCase =
    is_string(
        $_POST['mainUseCase'] ?? null
    )
        ? $_POST['mainUseCase']
        : '';

$rawPreferredRegion =
    is_string(
        $_POST['preferredRegion'] ?? null
    )
        ? $_POST['preferredRegion']
        : '';

$rawPlan =
    is_string(
        $_POST['plan'] ?? null
    )
        ? $_POST['plan']
        : '';

$rawTopic =
    is_string(
        $_POST['topic'] ?? null
    )
        ? $_POST['topic']
        : '';

$rawFormType =
    is_string(
        $_POST['formType'] ?? null
    )
        ? $_POST['formType']
        : '';

$rawMessage =
    is_string(
        $_POST['message'] ?? null
    )
        ? $_POST['message']
        : '';

$rawConsent =
    $_POST['consent'] ?? '';



$singleLineRawFields = [
    $rawFullName,
    $rawEmail,
    $rawCompany,
    $rawInquiryType,
    $rawProjectGoal,
    $rawBudgetRange,
    $rawPrimaryDevice,
    $rawMainUseCase,
    $rawPreferredRegion,
    $rawPlan,
    $rawTopic,
    $rawFormType
];

foreach (
    $singleLineRawFields as $rawValue
) {
    if (
        vpn_has_header_injection(
            $rawValue
        )
    ) {
        vpn_json_response(
            422,
            [
                'success' => false,
                'message' =>
                    'The submitted information contains invalid characters.'
            ]
        );
    }
}



$formType =
    vpn_clean_single_line(
        $rawFormType,
        40
    );

$fullName =
    vpn_clean_single_line(
        $rawFullName,
        120
    );

$email =
    vpn_clean_single_line(
        $rawEmail,
        190
    );

$company =
    vpn_clean_single_line(
        $rawCompany,
        160
    );

$inquiryType =
    vpn_clean_single_line(
        $rawInquiryType,
        120
    );

$projectGoal =
    vpn_clean_single_line(
        $rawProjectGoal,
        160
    );

$budgetRange =
    vpn_clean_single_line(
        $rawBudgetRange,
        160
    );

$primaryDevice =
    vpn_clean_single_line(
        $rawPrimaryDevice,
        120
    );

$mainUseCase =
    vpn_clean_single_line(
        $rawMainUseCase,
        160
    );

$preferredRegion =
    vpn_clean_single_line(
        $rawPreferredRegion,
        160
    );

$plan =
    vpn_clean_single_line(
        $rawPlan,
        120
    );

$topic =
    vpn_clean_single_line(
        $rawTopic,
        160
    );

$message =
    vpn_clean_multiline(
        $rawMessage,
        2000
    );



$allowedFormTypes = [
    'contact',
    'collaboration',
    'free-trial',
    'plan-inquiry'
];

if (
    !in_array(
        $formType,
        $allowedFormTypes,
        true
    )
) {
    vpn_json_response(
        422,
        [
            'success' => false,
            'message' =>
                'The submitted form type is invalid.'
        ]
    );
}



$consentValues = [
    'yes',
    'on',
    '1',
    1,
    true,
    'true'
];

$hasConsent = in_array(
    $rawConsent,
    $consentValues,
    true
);

if (!$hasConsent) {
    vpn_json_response(
        422,
        [
            'success' => false,
            'message' =>
                'Please confirm that you agree to submit this information.',
            'errors' => [
                'consent' =>
                    'Consent is required.'
            ]
        ]
    );
}



$errors = [];

if ($fullName === '') {
    $errors['fullName'] =
        'Please enter your full name.';
} elseif (
    vpn_string_length($fullName) < 2
) {
    $errors['fullName'] =
        'Please enter a valid name.';
}

if ($email === '') {
    $errors['email'] =
        'Please enter your email address.';
} elseif (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    $errors['email'] =
        'Please enter a valid email address.';
}

if (
    vpn_string_length(
        $rawFullName
    ) > 120
) {
    $errors['fullName'] =
        'The name is too long.';
}

if (
    vpn_string_length(
        $rawEmail
    ) > 190
) {
    $errors['email'] =
        'The email address is too long.';
}

if (
    vpn_string_length(
        $rawCompany
    ) > 160
) {
    $errors['company'] =
        'The company name is too long.';
}

if (
    vpn_string_length(
        $rawInquiryType
    ) > 120
) {
    $errors['inquiryType'] =
        'The inquiry type is too long.';
}

if (
    vpn_string_length(
        $rawProjectGoal
    ) > 160
) {
    $errors['projectGoal'] =
        'The project goal is too long.';
}

if (
    vpn_string_length(
        $rawBudgetRange
    ) > 160
) {
    $errors['budgetRange'] =
        'The budget value is too long.';
}

if (
    vpn_string_length(
        $rawPrimaryDevice
    ) > 120
) {
    $errors['primaryDevice'] =
        'The device value is too long.';
}

if (
    vpn_string_length(
        $rawMainUseCase
    ) > 160
) {
    $errors['mainUseCase'] =
        'The use case is too long.';
}

if (
    vpn_string_length(
        $rawPreferredRegion
    ) > 160
) {
    $errors['preferredRegion'] =
        'The region value is too long.';
}

if (
    vpn_string_length(
        $rawPlan
    ) > 120
) {
    $errors['plan'] =
        'The plan value is too long.';
}

if (
    vpn_string_length(
        $rawTopic
    ) > 160
) {
    $errors['topic'] =
        'The topic is too long.';
}

if (
    vpn_string_length(
        $rawMessage
    ) > 2000
) {
    $errors['message'] =
        'The message is too long.';
}



if (
    $formType === 'contact' ||
    $formType === 'collaboration'
) {
    if ($message === '') {
        $errors['message'] =
            'Please enter your message.';
    } elseif (
        vpn_string_length(
            $message
        ) < 10
    ) {
        $errors['message'] =
            'Please provide a little more detail.';
    }
}

if (
    $formType === 'free-trial'
) {
    if ($primaryDevice === '') {
        $errors['primaryDevice'] =
            'Please select your primary device.';
    }

    if ($mainUseCase === '') {
        $errors['mainUseCase'] =
            'Please select your main use case.';
    }

    if ($preferredRegion === '') {
        $errors['preferredRegion'] =
            'Please select your preferred region.';
    }
}

if (
    $formType === 'plan-inquiry'
) {
    if ($plan === '') {
        $errors['plan'] =
            'Please select a plan.';
    }
}

if (!empty($errors)) {
    $firstError =
        reset($errors);

    vpn_json_response(
        422,
        [
            'success' => false,
            'message' =>
                is_string($firstError)
                    ? $firstError
                    : $errorMessage,
            'errors' => $errors
        ]
    );
}



$formLabels = [
    'contact' =>
        'Website Contact Inquiry',

    'collaboration' =>
        'Collaboration Inquiry',

    'free-trial' =>
        'Free Trial Request',

    'plan-inquiry' =>
        'Plan Inquiry'
];

$formLabel =
    $formLabels[$formType] ??
    'Website Inquiry';

$subjectParts = [
    $siteName,
    $formLabel
];

if (
    $inquiryType !== '' &&
    $formType !== 'free-trial'
) {
    $subjectParts[] =
        $inquiryType;
}

if (
    $plan !== '' &&
    $formType === 'plan-inquiry'
) {
    $subjectParts[] =
        $plan;
}

$subject = implode(
    ' — ',
    $subjectParts
);

$subject =
    vpn_clean_single_line(
        $subject,
        200
    );



$body = '';

$body .=
    "New website request\n";

$body .=
    "===================\n\n";

$body .=
    vpn_field_line(
        'Website',
        $siteName
    );

$body .=
    vpn_field_line(
        'Form type',
        $formLabel
    );

$body .=
    vpn_field_line(
        'Name',
        $fullName
    );

$body .=
    vpn_field_line(
        'Email',
        $email
    );

$body .=
    vpn_field_line(
        'Company / Organisation',
        $company
    );

$body .=
    vpn_field_line(
        'Inquiry type',
        $inquiryType
    );

$body .=
    vpn_field_line(
        'Project goal',
        $projectGoal
    );

$body .=
    vpn_field_line(
        'Budget / Scope',
        $budgetRange
    );

$body .=
    vpn_field_line(
        'Primary device',
        $primaryDevice
    );

$body .=
    vpn_field_line(
        'Main use case',
        $mainUseCase
    );

$body .=
    vpn_field_line(
        'Preferred region',
        $preferredRegion
    );

$body .=
    vpn_field_line(
        'Plan',
        $plan
    );

$body .=
    vpn_field_line(
        'Topic',
        $topic
    );

$body .=
    "\n";

if ($message !== '') {
    $body .=
        "Message\n";

    $body .=
        "-------\n";

    $body .=
        $message . "\n\n";
}

$body .=
    "Consent: Confirmed\n";

$body .=
    "Submitted: " .
    gmdate(
        'Y-m-d H:i:s'
    ) .
    " UTC\n";



$safeCompanyName =
    vpn_clean_single_line(
        $companyName,
        160
    );

if ($safeCompanyName === '') {
    $safeCompanyName = $siteName;
}

$encodedCompanyName =
    vpn_encode_mail_name(
        $safeCompanyName
    );

$headers = [];

$headers[] =
    'MIME-Version: 1.0';

$headers[] =
    'Content-Type: text/plain; charset=UTF-8';

$headers[] =
    'Content-Transfer-Encoding: 8bit';

$headers[] =
    'From: ' .
    $encodedCompanyName .
    ' <' .
    $recipientEmail .
    '>';

$headers[] =
    'Reply-To: ' .
    $email;



$mailSent = @mail(
    $recipientEmail,
    $subject,
    $body,
    implode(
        "\r\n",
        $headers
    )
);

if (!$mailSent) {
    vpn_json_response(
        500,
        [
            'success' => false,
            'message' => $errorMessage
        ]
    );
}



vpn_json_response(
    200,
    [
        'success' => true,
        'message' => $successMessage
    ]
);
