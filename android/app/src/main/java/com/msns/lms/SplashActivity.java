package com.msns.lms;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.AnimatorSet;
import android.animation.ArgbEvaluator;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.DecelerateInterpolator;
import android.view.animation.OvershootInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    private FrameLayout splashRoot;
    private View rippleCircle;
    private View glowRing;
    private LinearLayout logoContainer;
    private ImageView shieldOutline;
    private ImageView torchIcon;
    private ImageView bookIcon;
    private TextView appNameText;
    private TextView mottoText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        setContentView(R.layout.activity_splash);

        // Enable fullscreen / edge-to-edge
        makeFullScreen();

        // Bind Views
        splashRoot = findViewById(R.id.splash_root);
        rippleCircle = findViewById(R.id.ripple_circle);
        glowRing = findViewById(R.id.glow_ring);
        logoContainer = findViewById(R.id.logo_container);
        shieldOutline = findViewById(R.id.shield_outline);
        torchIcon = findViewById(R.id.torch_icon);
        bookIcon = findViewById(R.id.book_icon);
        appNameText = findViewById(R.id.app_name_text);
        mottoText = findViewById(R.id.motto_text);

        // Start animation sequence
        startSplashAnimation();
    }

    private void makeFullScreen() {
        try {
            if (getWindow() == null) return;
            View decorView = getWindow().getDecorView();
            if (decorView == null) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = getWindow().getInsetsController();
                if (controller != null) {
                    controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                }
            } else {
                getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN
                );
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void startSplashAnimation() {
        // 1. Background Color Morph Animator (#000000 -> #020806 -> #051a14 -> #020806)
        ValueAnimator bgAnim = ValueAnimator.ofObject(
            new ArgbEvaluator(),
            Color.parseColor("#000000"),
            Color.parseColor("#020806"),
            Color.parseColor("#061f18"),
            Color.parseColor("#020806")
        );
        bgAnim.setDuration(2200);
        bgAnim.addUpdateListener(animator -> {
            splashRoot.setBackgroundColor((int) animator.getAnimatedValue());
        });

        // 2. Shield Morph: Fade & Scale in with Overshoot
        shieldOutline.setVisibility(View.VISIBLE);
        shieldOutline.setAlpha(0f);
        shieldOutline.setScaleX(0.2f);
        shieldOutline.setScaleY(0.2f);

        ObjectAnimator shieldAlpha = ObjectAnimator.ofFloat(shieldOutline, View.ALPHA, 0f, 1f);
        ObjectAnimator shieldScaleX = ObjectAnimator.ofFloat(shieldOutline, View.SCALE_X, 0.2f, 1.0f);
        ObjectAnimator shieldScaleY = ObjectAnimator.ofFloat(shieldOutline, View.SCALE_Y, 0.2f, 1.0f);
        
        AnimatorSet shieldSet = new AnimatorSet();
        shieldSet.playTogether(shieldAlpha, shieldScaleX, shieldScaleY);
        shieldSet.setDuration(800);
        shieldSet.setInterpolator(new OvershootInterpolator(1.2f));

        // 3. Torch Morph: Scale in & Pulse
        torchIcon.setVisibility(View.VISIBLE);
        torchIcon.setAlpha(0f);
        torchIcon.setScaleX(0.3f);
        torchIcon.setScaleY(0.3f);

        ObjectAnimator torchAlpha = ObjectAnimator.ofFloat(torchIcon, View.ALPHA, 0f, 1f);
        ObjectAnimator torchScaleX = ObjectAnimator.ofFloat(torchIcon, View.SCALE_X, 0.3f, 1.0f);
        ObjectAnimator torchScaleY = ObjectAnimator.ofFloat(torchIcon, View.SCALE_Y, 0.3f, 1.0f);

        AnimatorSet torchSet = new AnimatorSet();
        torchSet.playTogether(torchAlpha, torchScaleX, torchScaleY);
        torchSet.setDuration(600);
        torchSet.setStartDelay(400);
        torchSet.setInterpolator(new OvershootInterpolator(1.4f));

        // 4. Book Morph: Slide UP & Fade in
        bookIcon.setVisibility(View.VISIBLE);
        bookIcon.setAlpha(0f);
        bookIcon.setTranslationY(60f);

        ObjectAnimator bookAlpha = ObjectAnimator.ofFloat(bookIcon, View.ALPHA, 0f, 1f);
        ObjectAnimator bookTransY = ObjectAnimator.ofFloat(bookIcon, View.TRANSLATION_Y, 60f, 0f);

        AnimatorSet bookSet = new AnimatorSet();
        bookSet.playTogether(bookAlpha, bookTransY);
        bookSet.setDuration(600);
        bookSet.setStartDelay(650);
        bookSet.setInterpolator(new DecelerateInterpolator());

        // 5. Glow Ring Expansion & Pulse
        glowRing.setVisibility(View.VISIBLE);
        glowRing.setAlpha(0f);
        glowRing.setScaleX(0.5f);
        glowRing.setScaleY(0.5f);

        ObjectAnimator ringAlpha = ObjectAnimator.ofFloat(glowRing, View.ALPHA, 0f, 0.8f, 0.2f);
        ObjectAnimator ringScaleX = ObjectAnimator.ofFloat(glowRing, View.SCALE_X, 0.5f, 1.3f);
        ObjectAnimator ringScaleY = ObjectAnimator.ofFloat(glowRing, View.SCALE_Y, 0.5f, 1.3f);

        AnimatorSet ringSet = new AnimatorSet();
        ringSet.playTogether(ringAlpha, ringScaleX, ringScaleY);
        ringSet.setDuration(1000);
        ringSet.setStartDelay(800);
        ringSet.setInterpolator(new AccelerateDecelerateInterpolator());

        // 6. Ripple Circle Expansion
        rippleCircle.setVisibility(View.VISIBLE);
        rippleCircle.setAlpha(0.6f);
        rippleCircle.setScaleX(0.1f);
        rippleCircle.setScaleY(0.1f);

        ObjectAnimator rippleScaleX = ObjectAnimator.ofFloat(rippleCircle, View.SCALE_X, 0.1f, 3.5f);
        ObjectAnimator rippleScaleY = ObjectAnimator.ofFloat(rippleCircle, View.SCALE_Y, 0.1f, 3.5f);
        ObjectAnimator rippleAlpha = ObjectAnimator.ofFloat(rippleCircle, View.ALPHA, 0.6f, 0f);

        AnimatorSet rippleSet = new AnimatorSet();
        rippleSet.playTogether(rippleScaleX, rippleScaleY, rippleAlpha);
        rippleSet.setDuration(1100);
        rippleSet.setStartDelay(1000);
        rippleSet.setInterpolator(new DecelerateInterpolator());

        // 7. Text Fade & Motto Morph (Letter Spacing animation)
        appNameText.setVisibility(View.VISIBLE);
        appNameText.setAlpha(0f);
        appNameText.setTranslationY(30f);

        mottoText.setVisibility(View.VISIBLE);
        mottoText.setAlpha(0f);
        mottoText.setTranslationY(20f);

        ObjectAnimator appNameAlpha = ObjectAnimator.ofFloat(appNameText, View.ALPHA, 0f, 1f);
        ObjectAnimator appNameTransY = ObjectAnimator.ofFloat(appNameText, View.TRANSLATION_Y, 30f, 0f);

        ObjectAnimator mottoAlpha = ObjectAnimator.ofFloat(mottoText, View.ALPHA, 0f, 1f);
        ObjectAnimator mottoTransY = ObjectAnimator.ofFloat(mottoText, View.TRANSLATION_Y, 20f, 0f);

        ValueAnimator mottoSpacing = ValueAnimator.ofFloat(0.45f, 0.25f);
        mottoSpacing.addUpdateListener(animator -> {
            mottoText.setLetterSpacing((float) animator.getAnimatedValue());
        });

        AnimatorSet textSet = new AnimatorSet();
        textSet.playTogether(appNameAlpha, appNameTransY, mottoAlpha, mottoTransY, mottoSpacing);
        textSet.setDuration(700);
        textSet.setStartDelay(900);
        textSet.setInterpolator(new DecelerateInterpolator());

        // 8. Exit Morph: Scale up and fade out before opening MainActivity
        ObjectAnimator exitScaleX = ObjectAnimator.ofFloat(logoContainer, View.SCALE_X, 1.0f, 1.08f);
        ObjectAnimator exitScaleY = ObjectAnimator.ofFloat(logoContainer, View.SCALE_Y, 1.0f, 1.08f);
        ObjectAnimator exitAlpha = ObjectAnimator.ofFloat(splashRoot, View.ALPHA, 1.0f, 0.0f);

        AnimatorSet exitSet = new AnimatorSet();
        exitSet.playTogether(exitScaleX, exitScaleY, exitAlpha);
        exitSet.setDuration(450);
        exitSet.setStartDelay(2200);
        exitSet.setInterpolator(new AccelerateDecelerateInterpolator());

        exitSet.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                // Launch MainActivity
                Intent intent = new Intent(SplashActivity.this, MainActivity.class);
                startActivity(intent);
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                finish();
            }
        });

        // Master Animation Assembly
        AnimatorSet masterSet = new AnimatorSet();
        masterSet.playTogether(bgAnim, shieldSet, torchSet, bookSet, ringSet, rippleSet, textSet, exitSet);
        masterSet.start();
    }

    @Override
    public void onBackPressed() {
        // Disable back button during splash transition
    }
}
