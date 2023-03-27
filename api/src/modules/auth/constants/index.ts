export const EMAIL_CONTENT = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <body>
        <div style="padding: 3rem; margin-bottom: 1.8rem; max-width: 800px">
            <div
                style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                "
            >
                <h4 style="font-weight: 600; font-size: 1.4rem">
                    ĐẠI HỌC SƯ PHẠM THÀNH PHỐ HỒ CHÍ MINH - LẤY LẠI MẬT KHẨU
                </h4>
            </div>

            <div style="margin: auto">
                <p style="margin-bottom: 1rem">
                    TRƯỜNG ĐẠI HỌC SƯ PHẠM THÀNH PHỐ HỒ CHÍ MINH
                </p>
                <p style="margin-bottom: 1.5rem">
                    Thông báo về việc yêu câu lấy lại
                    mật khẩu.
                </p>
                <p style="margin-bottom: 1rem">
                    Nhấn vào đường link bên dưới để xác nhận đổi mật khẩu và tạo
                    mật khẩu mới
                </p>

                <a href="%s"
                    >%s</a
                >
            </div>
        </div>
    </body>
</html>`;
